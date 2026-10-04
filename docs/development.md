# 开发指南

## 创建项目

推荐 Node.js 24.9.0，与项目 Volta 配置一致；最低版本为 20.9。

锁文件使用 npm 公共源，仓库不依赖内部包地址。

```bash
npx create-next-app@latest my-app --example https://github.com/yayapao/nextpier --use-npm --no-agents-md
cd my-app
npm run dev
```

默认开发地址为 [localhost:3900](http://localhost:3900)。直接使用仓库时，先执行 `npm install`。

交给 ChatGPT / Codex 创建项目时，使用 [建项 Prompt](ai-agent.md)，填入目录、业务目标和数据来源即可。`--no-agents-md` 关闭 CLI 的 Agent 文件自动生成，项目沿用模板中的 `AGENTS.md` 与 `.agents/skills/`。

## 常用命令

在项目根目录执行：

| 命令                            | 用途                                        |
| ------------------------------- | ------------------------------------------- |
| `npm run dev`                   | Web 开发服务，端口 3900                     |
| `npm run build`                 | Web 生产构建                                |
| `npm run start`                 | 启动 Web 构建产物，默认端口 3000            |
| `npm run typecheck`             | TypeScript 检查                             |
| `npm run lint`                  | ESLint 检查                                 |
| `npm run test:cli`              | Wails、Harness 升级与运行时收集测试         |
| `npm run test:desktop-template` | 临时 Wails 工程的 Go 测试，需要桌面编译依赖 |
| `npm run upgrade:wails`         | 生成桌面工程                                |
| `npm run upgrade:harness`       | 生成 AI 对话工程并安装依赖                  |
| `npm run test:harness-template` | 临时 Harness 工程的类型、Lint 与运行时测试  |

升级后增加 `desktop:doctor`、`desktop:dev`、`desktop:build`，用法见 [桌面指南](desktop.md)。ChatGPT / Codex 的执行规则以 [AGENTS.md](../AGENTS.md) 为准。

Harness 升级后增加 `harness:doctor` 和 `test:harness`，入口为 `/harness`。模型、会话与插件配置见 [Browser Harness](harness.md)。

## 文件放哪里

```text
app/                  页面、layout、状态边界和 API
components/ui/        基础交互、AnimateIcons 和 Cult UI 适配组件
components/examples/  工作台与配置示例
components/build-in/  工具栏、主题切换
hooks/                通用 hooks
lib/                  数据读取、工具、校验与 provider
types/               共享类型
public/               静态资源
docs/                 建项 Prompt、开发、样式与集成文档
scripts/              Wails 与 Harness CLI、运行时收集和测试
templates/wails/      Wails 工程模板
templates/harness/    Browser Harness 工程模板
desktop/              升级后生成的桌面工程
harness/              升级后生成的 AI 对话核心、适配器与插件
nextpier.config.json  可选功能导航开关
```

共享类型从 `types/index.ts` 导出；旧 `lib/types/` 路径保留兼容。

## 接入自己的业务

首页在 `app/page.tsx`，当前渲染 `FoundationWorkbench`。示例工作项用 React state 保存，刷新恢复初始值；搜索、筛选和表单可作为交互参考。

接入数据时，在 Server Component 里调用 `lib/` 的读取函数，再把结果传给交互组件。业务写入优先使用 Server Actions，先校验和鉴权，再写入并调用 `revalidatePath()`。React Query 留给轮询、分页和交互后的刷新。

主题由 `next-themes` 管理，服务端配置写入 `data/config.json`，可通过 `NEXTPIER_DATA_DIR` 调整目录。当前配置作用于项目或本机；多用户应用要改为按用户存储。`ExampleConfigApi` 演示接收服务端 `initialConfig` 并通过兼容 API 更新主题。

开始交付前，替换这些默认项：

| 文件                                                         | 要改的内容                           |
| ------------------------------------------------------------ | ------------------------------------ |
| `lib/metadata.ts`                                            | 名称、描述、站点地址、作者、仓库链接 |
| `components/build-in/header/`                                | 工具栏布局与 Logo                    |
| `public/logo.png`、`public/dark-logo.png`、`app/favicon.ico` | 品牌资源                             |
| `app/page.tsx`                                               | 业务首页                             |

界面遵循 [组件与样式](design-system.md)。Next.js API 以当前安装版本的 `node_modules/next/dist/docs/` 为准。

NextPier 的公开名称、GitHub About 描述与 Topics 见 [GitHub 发布](github.md)。

[文档目录](README.md)
