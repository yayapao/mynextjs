package main

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type localServer struct {
	mu      sync.RWMutex
	proxy   *httputil.ReverseProxy
	message string
	cancel  context.CancelFunc
	done    chan struct{}
}

func newLocalServer() *localServer { return &localServer{message: "正在启动本地服务"} }

func (s *localServer) Start(parent context.Context) {
	ctx, cancel := context.WithCancel(parent)
	s.mu.Lock()
	s.cancel, s.done = cancel, make(chan struct{})
	done := s.done
	s.mu.Unlock()
	go func() {
		defer close(done)
		if err := s.run(ctx); err != nil && ctx.Err() == nil {
			s.fail(err)
		}
	}()
}

func (s *localServer) Stop() {
	s.mu.RLock()
	cancel, done := s.cancel, s.done
	s.mu.RUnlock()
	if cancel == nil {
		return
	}
	cancel()
	select {
	case <-done:
	case <-time.After(10 * time.Second):
	}
}

func (s *localServer) fail(err error) {
	s.mu.Lock()
	s.message, s.proxy = err.Error(), nil
	s.mu.Unlock()
}

func (s *localServer) run(ctx context.Context) error {
	if developmentURL := os.Getenv("MYNEXTJS_DEV_URL"); developmentURL != "" {
		target, err := url.Parse(developmentURL)
		if err != nil || target.Scheme != "http" || target.Hostname() != "127.0.0.1" {
			return errors.New("无效的开发服务 URL")
		}
		s.setProxy(target)
		<-ctx.Done()
		return nil
	}
	configDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}
	configDir = filepath.Join(configDir, appID)
	if err := os.MkdirAll(configDir, 0o700); err != nil {
		return err
	}
	logFile, err := os.OpenFile(filepath.Join(configDir, "desktop.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	defer logFile.Close()
	runtimeDir, err := prepareRuntime(embeddedRuntime)
	if err != nil {
		return err
	}
	node, err := findNode()
	if err != nil {
		return err
	}
	listener, err := net.Listen("tcp4", "127.0.0.1:0")
	if err != nil {
		return err
	}
	port := listener.Addr().(*net.TCPAddr).Port
	_ = listener.Close()
	environment, err := serverEnvironment(configDir, port)
	if err != nil {
		return err
	}
	command := exec.CommandContext(ctx, node, filepath.Join(runtimeDir, "server.js"))
	command.Dir, command.Env = runtimeDir, environment
	command.Stdout, command.Stderr = logFile, logFile
	command.WaitDelay = 5 * time.Second
	configureProcess(command)
	if err := command.Start(); err != nil {
		return err
	}
	exited := make(chan error, 1)
	go func() {
		exited <- command.Wait()
		close(exited)
	}()
	target, _ := url.Parse(fmt.Sprintf("http://127.0.0.1:%d", port))
	if err := waitForHealth(ctx, target.String(), exited); err != nil {
		if ctx.Err() == nil {
			_ = command.Cancel()
		}
		<-exited
		return err
	}
	s.setProxy(target)
	select {
	case err := <-exited:
		if err == nil {
			return errors.New("本地服务已退出")
		}
		return fmt.Errorf("本地服务异常退出，请查看 %s", filepath.Join(configDir, "desktop.log"))
	case <-ctx.Done():
		<-exited
		return nil
	}
}

func waitForHealth(ctx context.Context, upstream string, exited <-chan error) error {
	deadline := time.NewTimer(45 * time.Second)
	defer deadline.Stop()
	ticker := time.NewTicker(200 * time.Millisecond)
	defer ticker.Stop()
	client := &http.Client{Timeout: time.Second}
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-exited:
			return errors.New("本地服务启动失败，请查看应用配置目录中的 desktop.log")
		case <-deadline.C:
			return errors.New("本地服务启动超时，请查看应用配置目录中的 desktop.log")
		case <-ticker.C:
			request, _ := http.NewRequestWithContext(ctx, http.MethodGet, upstream+"/api/health", nil)
			response, err := client.Do(request)
			if err == nil {
				_ = response.Body.Close()
				if response.StatusCode == http.StatusOK {
					return nil
				}
			}
		}
	}
}

func (s *localServer) setProxy(target *url.URL) {
	proxy := httputil.NewSingleHostReverseProxy(target)
	original := proxy.Director
	proxy.Director = func(request *http.Request) {
		original(request)
		// Server Actions compare Origin and forwarded host; use the local upstream consistently.
		if origin := request.Header.Get("Origin"); origin == "wails://wails" || origin == "http://wails.localhost" || origin == "https://wails.localhost" {
			request.Header.Set("Origin", target.String())
		}
		request.Host = target.Host
		request.Header.Set("X-Forwarded-Host", target.Host)
		request.Header.Set("X-Forwarded-Proto", "http")
		request.Header.Set("Accept-Encoding", "identity")
	}
	proxy.ModifyResponse = func(response *http.Response) error {
		if redirect, err := url.Parse(response.Header.Get("Location")); err == nil && redirect.Host == target.Host {
			redirect.Scheme, redirect.Host = "", ""
			response.Header.Set("Location", redirect.String())
		}
		return nil
	}
	proxy.ErrorHandler = func(writer http.ResponseWriter, _ *http.Request, err error) {
		s.fail(errors.New("本地服务连接中断"))
		http.Error(writer, "本地服务连接中断", http.StatusBadGateway)
	}
	s.mu.Lock()
	s.proxy = proxy
	s.mu.Unlock()
}

func (s *localServer) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	s.mu.RLock()
	proxy, message := s.proxy, s.message
	s.mu.RUnlock()
	if proxy != nil {
		proxy.ServeHTTP(writer, request)
		return
	}
	if request.Method != http.MethodGet && request.Method != http.MethodHead {
		http.Error(writer, "本地服务未就绪", http.StatusServiceUnavailable)
		return
	}
	writer.Header().Set("Content-Type", "text/html; charset=utf-8")
	writer.Header().Set("Cache-Control", "no-store")
	writer.Header().Set("Refresh", "2")
	message = strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;", "\"", "&quot;").Replace(message)
	_, _ = fmt.Fprintf(writer, `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>启动</title></head><body style="font:14px -apple-system,sans-serif;margin:48px"><p role="status">%s</p></body></html>`, message)
}
