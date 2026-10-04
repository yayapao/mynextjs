package main

import (
	"bytes"
	"net/http"
	"strings"
)

const runtimeScripts = `<script src="/wails/ipc.js"></script><script src="/wails/runtime.js"></script>`

// Wails injects scripts only at / and /index.html. Preserve streaming on other routes.
func runtimeMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.Method != http.MethodGet || strings.HasSuffix(request.URL.Path, "/") || strings.HasSuffix(request.URL.Path, "/index.html") {
			next.ServeHTTP(writer, request)
			return
		}
		stream := &runtimeWriter{ResponseWriter: writer}
		next.ServeHTTP(stream, request)
		stream.finish()
	})
}

type runtimeWriter struct {
	http.ResponseWriter
	status   int
	html     bool
	injected bool
	pending  bytes.Buffer
}

func (w *runtimeWriter) Unwrap() http.ResponseWriter { return w.ResponseWriter }

func (w *runtimeWriter) WriteHeader(status int) {
	if w.status != 0 {
		return
	}
	w.status = status
	w.html = strings.Contains(w.Header().Get("Content-Type"), "text/html") && w.Header().Get("Content-Encoding") == ""
	if w.html {
		w.Header().Del("Content-Length")
		w.Header().Del("ETag")
	}
	w.ResponseWriter.WriteHeader(status)
}

func (w *runtimeWriter) Write(payload []byte) (int, error) {
	if w.status == 0 {
		w.WriteHeader(http.StatusOK)
	}
	if !w.html || w.injected {
		return w.ResponseWriter.Write(payload)
	}
	w.pending.Write(payload)
	data := w.pending.Bytes()
	if index := bytes.Index(data, []byte("<head>")); index >= 0 {
		index += len("<head>")
		body := append([]byte{}, data[:index]...)
		body = append(body, runtimeScripts...)
		body = append(body, data[index:]...)
		w.pending.Reset()
		w.injected = true
		_, err := w.ResponseWriter.Write(body)
		return len(payload), err
	}
	if w.pending.Len() > 65536 {
		w.finish()
	}
	return len(payload), nil
}

func (w *runtimeWriter) finish() {
	if w.pending.Len() > 0 {
		_, _ = w.ResponseWriter.Write(w.pending.Bytes())
		w.pending.Reset()
	}
	w.injected = true
}

func (w *runtimeWriter) Flush() {
	if w.status == 0 {
		w.WriteHeader(http.StatusOK)
	}
	if w.html && !w.injected {
		return
	}
	_ = http.NewResponseController(w.ResponseWriter).Flush()
}
