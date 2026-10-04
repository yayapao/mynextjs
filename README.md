# NextPier

**Web first. Desktop next.**

面向工作台的 Next.js 模板。AnimateIcons、Cult UI 和紧凑样式已就位；Wails 桌面和 Browser Harness AI 对话，用 CLI 按需接上。

[English](README.en.md) · [开发指南](docs/development.md) · [桌面指南](docs/desktop.md)

## 开工

```bash
npx create-next-app@latest my-app --example https://github.com/yayapao/nextpier --use-npm --no-agents-md
cd my-app
npm run dev
```

打开 [localhost:3900](http://localhost:3900)。直接使用此仓库，先执行 `npm install`。

## 交给 ChatGPT / Codex

改掉方括号里的内容，直接发给 ChatGPT / Codex：

```text
请基于 https://github.com/yayapao/nextpier 在 [目标目录] 创建 [项目名]。
业务目标：[谁使用、要完成什么]。主要流程：[列出流程]。
数据来源：[API、数据库或单用户本地持久化]。能力：[Web / Web+AI / Wails / Wails+AI]。
用 create-next-app 的 --example 和 --no-agents-md 创建工程并安装依赖；目标目录非空时先检查已有内容。
先读 AGENTS.md、docs/README.md、docs/ai-agent.md 和当前安装的 Next.js 文档。
按现有组件与样式规范完成业务首页、数据读写、表单校验及加载、空、错误状态。
需要 AI 时运行 npm run upgrade:harness；需要桌面时运行 npm run upgrade:wails 并设置应用名称和 ID。
更新项目名称、metadata 和 README，运行 typecheck、lint、test:cli；接入 AI 后运行 test:harness。
直接完成实现。默认不启动 dev、不构建或打包；交付时列出命令、检查结果和待验证项。
```

完整 Prompt 与具体场景见 [ChatGPT / Codex 建项](docs/ai-agent.md)。

## 上桌面

```bash
npm run upgrade:wails -- --name MyApp --id com.example.myapp
npm run desktop:doctor
npm run desktop:dev
```

升级命令生成 `desktop/`。打包执行 `npm run desktop:build`，产物在 `desktop/build/bin/`。

桌面开发需要 Go 1.25+、Wails CLI 2.15.0 和系统编译依赖。应用运行需要 Node.js 20.9+，安装包暂未内置 Node。详见 [桌面指南](docs/desktop.md)。

## 接上 AI

```bash
npm run upgrade:harness
npm run harness:doctor
```

在 `/harness` 对话、调用工具、确认操作。默认演示模式无需 Key；接模型、换插件或存储，见 [Browser Harness](docs/harness.md)。Web 与 Wails 共用这套运行时。

## 默认取舍

- Next.js 16.2、React 19、TypeScript、Tailwind CSS 4。
- 动态图标优先 AnimateIcons，视觉组件先看 Cult UI；基础交互用 shadcn/Radix。
- 中文短文案、32px 控件、6px 基础圆角，深浅主题共用语义色。
- 服务端读初始数据，客户端处理交互；表单用 React Hook Form + Zod。
- Wails 包装本地 Next.js 服务，保留 Server Actions、Flight 和 SSE。
- AI 对话按需接入，模型、存储、业务插件可替换，写操作由用户确认。

首页放了可操作的工作台示例。工作项只保存在当前会话，接入业务时换成自己的数据。

## 继续读

[建项 Prompt](docs/ai-agent.md) · [开发指南](docs/development.md) · [组件与样式](docs/design-system.md) · [桌面指南](docs/desktop.md) · [Browser Harness](docs/harness.md) · [AGENTS.md](AGENTS.md)

组件与样式规范沿用 [Niu](https://github.com/yayapao/niu)。代码采用 [MIT](LICENSE)，Cult UI 的来源与许可证随组件保留。
