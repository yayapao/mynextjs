package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestRuntimeInjectionAcrossStreamedChunks(t *testing.T) {
	handler := runtimeMiddleware(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Content-Length", "99")
		_, _ = io.WriteString(w, "<html><hea")
		w.(http.Flusher).Flush()
		_, _ = io.WriteString(w, "d><title>Test</title></head><body>Page</body></html>")
		w.(http.Flusher).Flush()
	}))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "http://wails.localhost/settings", nil))
	if strings.Count(response.Body.String(), runtimeScripts) != 1 {
		t.Fatal(response.Body.String())
	}
	if response.Header().Get("Content-Length") != "" || !response.Flushed {
		t.Fatal("streaming headers were not preserved")
	}
}

func TestRuntimeMiddlewarePreservesSSEAndFlight(t *testing.T) {
	for _, contentType := range []string{"text/event-stream", "text/x-component"} {
		handler := runtimeMiddleware(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", contentType)
			_, _ = io.WriteString(w, "data: first\n\n")
			w.(http.Flusher).Flush()
			_, _ = io.WriteString(w, "data: last\n\n")
		}))
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "http://wails.localhost/events", nil))
		if response.Body.String() != "data: first\n\ndata: last\n\n" || !response.Flushed {
			t.Fatal("response was buffered or modified")
		}
	}
}

func TestProxyForwardsActionOriginBodyAndRedirect(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		if string(body) != "payload" || r.Header.Get("Next-Action") != "action-id" {
			t.Error("action body/header lost")
		}
		if r.Header.Get("Origin") != "http://"+r.Host || r.Header.Get("X-Forwarded-Host") != r.Host {
			t.Error("action origin mismatch")
		}
		w.Header().Set("Location", "http://"+r.Host+"/next")
		w.WriteHeader(http.StatusSeeOther)
	}))
	defer upstream.Close()
	target, _ := url.Parse(upstream.URL)
	server := newLocalServer()
	server.setProxy(target)
	request := httptest.NewRequest(http.MethodPost, "http://wails.localhost/form", strings.NewReader("payload"))
	request.Header.Set("Origin", "http://wails.localhost")
	request.Header.Set("Next-Action", "action-id")
	response := httptest.NewRecorder()
	server.ServeHTTP(response, request)
	if response.Code != http.StatusSeeOther || response.Header().Get("Location") != "/next" {
		t.Fatal("redirect escaped the webview")
	}
}

func TestProxyPreservesUntrustedOriginForNextValidation(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Origin") != "https://example.invalid" {
			t.Error("untrusted origin was rewritten")
		}
		w.WriteHeader(http.StatusForbidden)
	}))
	defer upstream.Close()
	target, _ := url.Parse(upstream.URL)
	server := newLocalServer()
	server.setProxy(target)
	request := httptest.NewRequest(http.MethodPost, "http://wails.localhost/form", nil)
	request.Header.Set("Origin", "https://example.invalid")
	response := httptest.NewRecorder()
	server.ServeHTTP(response, request)
	if response.Code != http.StatusForbidden {
		t.Fatal("upstream rejection was lost")
	}
}
