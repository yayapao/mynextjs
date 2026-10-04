# mynextjs

基于 Niu 工程实践的 Next.js 工作台模板，Web 项目安装后可通过 CLI 升级为 Wails 桌面应用。

## 安装

```bash
npx create-next-app@latest my-app --example https://github.com/yayapao/mynextjs --use-npm
cd my-app
npm run dev
```

直接使用此仓库时先执行 `npm install`。开发地址默认 [http://localhost:3900](http://localhost:3900)。

## 升级 Wails

```bash
npm run upgrade:wails -- --name MyApp --id com.example.myapp
npm run desktop:doctor
npm run desktop:dev
```

打包：

```bash
npm run desktop:build
# macOS 双架构客户端
npm run desktop:build -- --platform darwin/universal
```

升级生成工程，开发和打包由独立命令执行。要求 Go 1.25+、Wails CLI 2.15.0 和系统编译依赖；应用运行仍需要 Node.js 20.9+。完整配置见 [桌面应用文档](docs/desktop.md)。

## 基础能力

- Next.js 16.2.1、React 19、TypeScript、Tailwind CSS 4。
- AnimateIcons 优先，按子路径导入；图标按钮提供 Tooltip、键盘反馈和减少动态效果支持。
- Cult UI 的动态数字、纹理按钮、Minimal Card，沿用 Niu 适配方式。
- shadcn/Radix 的 Dialog、Form、Input、Select、Tabs、Table、Badge、Checkbox、Switch、菜单和 Tooltip。
- 语义色、深浅主题、6px 基础圆角、32px 控件、中文紧凑布局。
- React Hook Form + Zod、React Query、Zustand、date-fns。
- Wails 内嵌完整 standalone 服务，保留 Server Actions、Flight 和 SSE，数据放独立用户目录。

首页为交互工作台示例，工作项仅保存于当前会话；接入业务数据时使用服务端读取和 Server Actions。

## 项目结构

```text
app/                  页面、layout、状态边界和 API
components/ui/        shadcn、AnimateIcons 和 Cult UI 适配组件
components/examples/  交互工作台与配置示例
components/build-in/  主题与工具栏
hooks/                通用 hooks
lib/                  工具、配置、校验、provider
types/                共享业务与组件类型
docs/                 基础样式和桌面文档
scripts/              Wails CLI、运行时打包和测试
templates/wails/      可生成的 Wails v2 工程
desktop/              升级命令执行后生成
```

## 验证与构建

```bash
npm run typecheck
npm run lint
npm run test:cli
npm run test:desktop-template  # 需要 Go 与系统编译依赖
npm run build
npm run start
```

开发规范见 [AGENTS.md](AGENTS.md)，样式和组件使用见 [设计规范](docs/design-system.md)。Next.js API 以当前安装版本的 `node_modules/next/dist/docs/` 为准。
