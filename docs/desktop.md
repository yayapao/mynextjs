# 升级为 Wails 应用

## 一键升级

安装基础 mynextjs 项目及 npm 依赖后，在项目根目录执行：

```bash
npm run upgrade:wails -- --name MyApp --id com.example.myapp
```

`--name` 和 `--id` 可省略，默认从 `package.json.name` 派生应用名和 `com.example.<name>`。应用名允许中文与空格；ID 至少三段，使用小写字母、数字和连字符。正式应用应指定自己的 ID。

命令生成 `desktop/`、追加 npm 脚本和生成产物的 Git 忽略规则，不修改已有 Web 启动命令。重复执行保留已有桌面文件；遇到未知 `desktop/` 或同名脚本冲突时退出。升级步骤只生成工程，开发或打包在下一步显式执行。

## 开发环境

- Node.js 20.9+，推荐项目的 Volta Node 24.9。
- Go 1.25+，与 Wails v2.15.0 保持一致。
- Wails CLI v2.15.0。
- macOS：Xcode Command Line Tools；Windows：WebView2 和 Wails 所需编译环境；Linux：GTK/WebKit 开发依赖，使用 `wails doctor` 检查。

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@v2.15.0
npm run desktop:doctor
npm run desktop:dev
```

`desktop:dev` 分配空闲的 loopback 端口，启动 Next.js HMR，等待 `/api/health` 成功，再运行 Wails 开发窗口。窗口使用 Next.js 开发服务；命令退出时清理服务进程。Go 在首次运行时下载依赖。

## 打包

```bash
npm run desktop:build
# macOS 双架构 Go 客户端
npm run desktop:build -- --platform darwin/universal
```

默认平台为当前系统和架构；在对应操作系统上构建。命令依次运行 Next.js 构建、收集运行时、执行 Wails 构建，输出到 `desktop/build/bin/`。不自动安装或启动应用。

桌面构建设置 `MYNEXTJS_DESKTOP=1`，使 `next.config.ts` 启用 `output: 'standalone'` 和 `images.unoptimized`。支持默认 Turbopack；runtime 以单个 `runtime.tar.gz` 嵌入，避免动态路由和 chunk 文件名与 Go embed 冲突。静态导出 `output: 'export'` 无法承载 Server Actions，因此这里使用完整本地 Node.js 服务。

当前模板不内置 Node.js，用户机器必须安装兼容版本；也可设置 `MYNEXTJS_NODE` 为 Node 可执行文件绝对路径。macOS 可发现 PATH、Homebrew 和 zsh 登录环境中的 Node。若新增原生 Node 依赖，需为目标架构准备依赖；`darwin/universal` 仅保证 Go 客户端的双架构，单个运行时包不会自动生成两套原生 Node 依赖。

## 运行时

1. standalone、`.next/static`、`public` 收集为压缩包，解引用依赖符号链接。
2. 收集阶段排除 `.env*`、`.git` 和 standalone 顶层 `data/`。不把本机密钥或用户数据装入应用。
3. 包的内容摘要标识运行时版本。Go 将它解压到系统用户缓存，拒绝越界路径和符号链接；只有完整解压才创建完成标记。
4. Node 服务监听动态 `127.0.0.1` 端口。Wails AssetServer 代理页面、API、Flight、Server Actions 和 SSE。
5. 代理统一受信任 Wails Origin 和 forwarded host，使 Server Actions 可校验来源；其他 Origin 保持原样交给 Next.js 校验。
6. 非根 HTML 路由注入 Wails runtime 脚本；SSE/Flight 保持流式传输。应用退出时结束 Node 进程树。

基础工具栏已有 `app-toolbar` 拖拽区和 `app-toolbar__interactive` 非拖拽区。Wails 提供原生窗口与 Edit 菜单；业务需要更多能力时在 Go 侧注册绑定并补齐类型。

## 数据与环境配置

数据目录以应用 ID 隔离，升级和重新打包不会覆盖用户配置。

| 系统    | 配置目录                                              |
| ------- | ----------------------------------------------------- |
| macOS   | `~/Library/Application Support/<app-id>/`             |
| Windows | `%AppData%/<app-id>/`                                 |
| Linux   | `$XDG_CONFIG_HOME/<app-id>/` 或 `~/.config/<app-id>/` |

在配置目录放 `.env.local`，服务启动时读取；进程环境优先。`MYNEXTJS_DATA_DIR` 指向其 `data/` 子目录，`lib/config.ts` 已遵循该路径。`desktop.log` 位于同一配置目录；运行时缓存与数据目录分离。

修改应用身份需同步 `desktop/main.go`、`mynextjs.json`、`wails.json`、两个 macOS plist。修改 ID 会改变配置目录，迁移数据需自行处理。

## 验证

```bash
npm run typecheck
npm run lint
npm run test:cli
npm run test:desktop-template
```

CLI 测试覆盖生成、冲突、重复升级、路径和运行时收集；桌面模板测试在临时工程执行 `go test`，检查压缩包解压、流式代理、runtime 注入和 Server Actions 转发。此类测试不等于完成应用打包与原生窗口验收。

## 手动修改 Next 配置后

CLI 检查 `next.config.ts` 中的 `MYNEXTJS_DESKTOP` 标记，避免生成不能打包的工程。若重写了配置，保留：

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.MYNEXTJS_DESKTOP === '1'
    ? {
        output: 'standalone',
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
```

若项目改为 monorepo 或自定义 `distDir`，需同步 runtime 收集路径与 tracing 配置；本模板按标准单项目 `.next/standalone/server.js` 结构工作。
