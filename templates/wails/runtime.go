package main

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

func prepareRuntime(source fs.FS) (string, error) {
	data, err := fs.ReadFile(source, "runtime.tar.gz")
	if err != nil {
		return "", err
	}
	if len(data) < 2 || data[0] != 0x1f || data[1] != 0x8b {
		return "", errors.New("运行时尚未准备，请执行 npm run desktop:build")
	}
	digest := sha256.Sum256(data)
	version := hex.EncodeToString(digest[:])[:20]
	cache, err := os.UserCacheDir()
	if err != nil {
		return "", err
	}
	cache = filepath.Join(cache, appID, "runtime")
	if err := os.MkdirAll(cache, 0o700); err != nil {
		return "", err
	}
	destination := filepath.Join(cache, version)
	if _, err := os.Stat(filepath.Join(destination, ".complete")); err == nil {
		if _, err := os.Stat(filepath.Join(destination, "server.js")); err == nil {
			return destination, nil
		}
	}
	temporary, err := os.MkdirTemp(cache, ".extract-")
	if err != nil {
		return "", err
	}
	defer os.RemoveAll(temporary)
	if err := extractArchive(bytes.NewReader(data), temporary); err != nil {
		return "", err
	}
	if _, err := os.Stat(filepath.Join(temporary, "server.js")); err != nil {
		return "", err
	}
	if err := os.WriteFile(filepath.Join(temporary, ".complete"), []byte(version), 0o600); err != nil {
		return "", err
	}
	if err := os.RemoveAll(destination); err != nil {
		return "", err
	}
	if err := os.Rename(temporary, destination); err != nil {
		return "", err
	}
	return destination, nil
}

func extractArchive(input io.Reader, destination string) error {
	compressed, err := gzip.NewReader(input)
	if err != nil {
		return err
	}
	defer compressed.Close()
	archive := tar.NewReader(compressed)
	for {
		header, err := archive.Next()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		name := filepath.FromSlash(header.Name)
		if !filepath.IsLocal(name) {
			return errors.New("运行时包含无效路径")
		}
		target := filepath.Join(destination, name)
		switch header.Typeflag {
		case tar.TypeDir:
			if err := os.MkdirAll(target, 0o700); err != nil {
				return err
			}
		case tar.TypeReg, tar.TypeRegA:
			if err := os.MkdirAll(filepath.Dir(target), 0o700); err != nil {
				return err
			}
			mode := os.FileMode(0o600)
			if header.Mode&0o111 != 0 {
				mode = 0o700
			}
			output, err := os.OpenFile(target, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, mode)
			if err != nil {
				return err
			}
			_, copyErr := io.Copy(output, archive)
			closeErr := output.Close()
			if copyErr != nil {
				return copyErr
			}
			if closeErr != nil {
				return closeErr
			}
		default:
			return errors.New("运行时包含不支持的链接或文件类型")
		}
	}
}

func findNode() (string, error) {
	candidates := []string{os.Getenv("NEXTPIER_NODE"), os.Getenv("MYNEXTJS_NODE")}
	if node, err := exec.LookPath("node"); err == nil {
		candidates = append(candidates, node)
	}
	if runtime.GOOS == "darwin" {
		candidates = append(candidates, "/opt/homebrew/bin/node", "/usr/local/bin/node")
		if output, err := exec.Command("/bin/zsh", "-lic", "command -v node").Output(); err == nil {
			candidates = append(candidates, strings.TrimSpace(string(output)))
		}
	}
	for _, candidate := range candidates {
		if candidate == "" {
			continue
		}
		output, err := exec.Command(candidate, "--version").Output()
		if err != nil {
			continue
		}
		parts := strings.Split(strings.TrimPrefix(strings.TrimSpace(string(output)), "v"), ".")
		if len(parts) < 2 {
			continue
		}
		major, _ := strconv.Atoi(parts[0])
		minor, _ := strconv.Atoi(parts[1])
		if major > 20 || major == 20 && minor >= 9 {
			return candidate, nil
		}
	}
	return "", errors.New("未找到 Node.js 20.9+；请安装 Node.js 或设置 NEXTPIER_NODE")
}

func serverEnvironment(configDir string, port int) ([]string, error) {
	values := map[string]string{}
	for _, item := range os.Environ() {
		key, value, ok := strings.Cut(item, "=")
		if ok {
			values[key] = value
		}
	}
	envFile := filepath.Join(configDir, ".env.local")
	if fileValues, err := godotenv.Read(envFile); err == nil {
		for key, value := range fileValues {
			if _, ok := values[key]; !ok {
				values[key] = value
			}
		}
	} else if !os.IsNotExist(err) {
		return nil, err
	}
	values["NODE_ENV"] = "production"
	values["HOSTNAME"] = "127.0.0.1"
	values["PORT"] = strconv.Itoa(port)
	values["NEXTPIER_DATA_DIR"] = filepath.Join(configDir, "data")
	values["NEXTPIER_INTERNAL_URL"] = "http://127.0.0.1:" + strconv.Itoa(port)
	// Preserve data access for applications using the original environment keys.
	values["MYNEXTJS_DATA_DIR"] = values["NEXTPIER_DATA_DIR"]
	values["MYNEXTJS_INTERNAL_URL"] = values["NEXTPIER_INTERNAL_URL"]
	result := make([]string, 0, len(values))
	for key, value := range values {
		result = append(result, key+"="+value)
	}
	return result, nil
}
