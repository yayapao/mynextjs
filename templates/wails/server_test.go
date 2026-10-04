package main

import (
	"context"
	"strings"
	"testing"
)

func TestDevelopmentURLNamingCompatibility(t *testing.T) {
	for _, example := range []struct {
		name, primary, legacy string
		wantError             bool
	}{
		{"primary wins", "http://127.0.0.1:3900", "invalid", false},
		{"legacy fallback", "", "http://127.0.0.1:3900", false},
		{"invalid primary rejected", "https://example.com", "http://127.0.0.1:3900", true},
	} {
		t.Run(example.name, func(t *testing.T) {
			t.Setenv("NEXTPIER_DEV_URL", example.primary)
			t.Setenv("MYNEXTJS_DEV_URL", example.legacy)
			ctx, cancel := context.WithCancel(context.Background())
			cancel()
			server := newLocalServer()
			err := server.run(ctx)
			if example.wantError {
				if err == nil || !strings.Contains(err.Error(), "无效的开发服务 URL") {
					t.Fatalf("expected URL validation error, got %v", err)
				}
				return
			}
			if err != nil || server.proxy == nil {
				t.Fatalf("development proxy not configured: %v", err)
			}
		})
	}
}
