# NextPier

**Web first. Desktop next.**

面向工作台的 Next.js 模板。AnimateIcons、Cult UI 和紧凑样式已就位；需要桌面时，一条命令接上 Wails，保留 Server Actions。

[English](README.en.md) · [开发指南](docs/development.md) · [桌面指南](docs/desktop.md)

## 开工

```bash
npx create-next-app@latest my-app --example https://github.com/yayapao/mynextjs --use-npm
cd my-app
npm run dev
```

打开 [localhost:3900](http://localhost:3900)。直接使用此仓库，先执行 `npm install`。

## 上桌面

```bash
npm run upgrade:wails -- --name MyApp --id com.example.myapp
npm run desktop:doctor
npm run desktop:dev
```

升级命令生成 `desktop/`。打包执行 `npm run desktop:build`，产物在 `desktop/build/bin/`。

桌面开发需要 Go 1.25+、Wails CLI 2.15.0 和系统编译依赖。应用运行需要 Node.js 20.9+，安装包暂未内置 Node。详见 [桌面指南](docs/desktop.md)。

## 默认取舍

- Next.js 16.2、React 19、TypeScript、Tailwind CSS 4。
- 动态图标优先 AnimateIcons，视觉组件先看 Cult UI；基础交互用 shadcn/Radix。
- 中文短文案、32px 控件、6px 基础圆角，深浅主题共用语义色。
- 服务端读初始数据，客户端处理交互；表单用 React Hook Form + Zod。
- Wails 包装本地 Next.js 服务，保留 Server Actions、Flight 和 SSE。

首页放了可操作的工作台示例。工作项只保存在当前会话，接入业务时换成自己的数据。

## 继续读

[开发指南](docs/development.md) · [组件与样式](docs/design-system.md) · [桌面指南](docs/desktop.md) · [AGENTS.md](AGENTS.md) · [GitHub 发布](docs/github.md)

组件与样式规范沿用 [Niu](https://github.com/yayapao/niu)。代码采用 [MIT](LICENSE)，Cult UI 的来源与许可证随组件保留。
