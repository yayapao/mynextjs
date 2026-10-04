package main

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"os"
	"path/filepath"
	"testing"
)

func archiveWithEntry(t *testing.T, name string, kind byte, body string) []byte {
	t.Helper()
	var buffer bytes.Buffer
	compressed := gzip.NewWriter(&buffer)
	archive := tar.NewWriter(compressed)
	header := &tar.Header{Name: name, Mode: 0o600, Typeflag: kind}
	if kind == tar.TypeReg {
		header.Size = int64(len(body))
	}
	if err := archive.WriteHeader(header); err != nil {
		t.Fatal(err)
	}
	if kind == tar.TypeReg {
		if _, err := archive.Write([]byte(body)); err != nil {
			t.Fatal(err)
		}
	}
	if err := archive.Close(); err != nil {
		t.Fatal(err)
	}
	if err := compressed.Close(); err != nil {
		t.Fatal(err)
	}
	return buffer.Bytes()
}

func TestExtractArchiveSupportsDynamicRouteNames(t *testing.T) {
	root := t.TempDir()
	data := archiveWithEntry(t, "./.next/server/app/[id]/page.js", tar.TypeReg, "page")
	if err := extractArchive(bytes.NewReader(data), root); err != nil {
		t.Fatal(err)
	}
	body, err := os.ReadFile(filepath.Join(root, ".next", "server", "app", "[id]", "page.js"))
	if err != nil || string(body) != "page" {
		t.Fatalf("extraction failed: %s, %v", body, err)
	}
}

func TestExtractArchiveRejectsTraversalAndLinks(t *testing.T) {
	for _, entry := range []struct {
		name string
		kind byte
	}{
		{"../outside.txt", tar.TypeReg}, {"/outside.txt", tar.TypeReg}, {"link", tar.TypeSymlink},
	} {
		data := archiveWithEntry(t, entry.name, entry.kind, "payload")
		if err := extractArchive(bytes.NewReader(data), t.TempDir()); err == nil {
			t.Fatalf("accepted unsafe entry: %s", entry.name)
		}
	}
}

func TestServerEnvironmentUsesPersistentDataAndLoopback(t *testing.T) {
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, ".env.local"), []byte("EXAMPLE_SECRET=file\nPORT=1\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("EXAMPLE_SECRET", "environment")
	values, err := serverEnvironment(root, 12345)
	if err != nil {
		t.Fatal(err)
	}
	want := map[string]bool{"HOSTNAME=127.0.0.1": false, "PORT=12345": false, "EXAMPLE_SECRET=environment": false, "MYNEXTJS_DATA_DIR=" + filepath.Join(root, "data"): false}
	for _, value := range values {
		if _, ok := want[value]; ok {
			want[value] = true
		}
	}
	for value, found := range want {
		if !found {
			t.Errorf("missing %s", value)
		}
	}
}
