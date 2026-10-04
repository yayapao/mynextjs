# Browser Harness

应用内的 AI 对话运行时，沿用 Niu 的 Gateway、Orchestrator、Registry 与插件架构。浏览器负责交互，服务端调用模型和工具。

## 一条命令接入

在已安装 npm 依赖的 NextPier 项目根目录执行：

```bash
npm run upgrade:harness
npm run harness:doctor
```

CLI 生成源码、注册类型、打开导航入口，并执行 `npm install`，增加 `openai`、`eventsource-parser` 和开发依赖 `tsx`。Web 首页保持工作台；AI 对话在 `/harness`，可从顶部的对话图标进入。

已有 dev 服务时重新加载页面；未启动时执行 `npm run dev`。集成命令本身不启动服务、不调用模型、不构建。

只生成文件、稍后安装依赖：

```bash
npm run upgrade:harness -- --skip-install
npm install
```

重复执行保留已生成的源码和业务修改。未知目录、同名脚本或文件冲突会使命令退出；生成中途失败会回滚本次文件和元数据。安装依赖失败时工程保留，重新运行 `npm install` 即可。

## 先试演示，再接模型

默认 `HARNESS_MODE=demo`，无需 API Key。示例提供读取当前时间、读取便签和确认后保存便签；演示模型按固定规则调用工具，不是 LLM。

真实模型配置写入 `.env.local`，变量模板由 CLI 生成在 `.env.harness.example`：

```dotenv
HARNESS_MODE=openai
HARNESS_MODEL=你的模型名称
OPENAI_API_KEY=你的密钥
# 可选，按服务商填写完整 API 基础地址
OPENAI_BASE_URL=https://api.openai.com/v1
```

修改后重启 Web 或桌面应用。模型须支持 Chat Completions 的流式输出与工具调用；密钥只在服务端使用，不加 `NEXT_PUBLIC_` 前缀。适配器沿用 Niu 的 OpenAI 兼容 SDK 实现，工具调用格式见 [OpenAI 官方文档](https://developers.openai.com/api/docs/guides/function-calling)。

`harness:doctor` 检查文件、依赖和环境配置，不发送模型请求。

## 分层与目录

```text
浏览器界面 → Server Actions / SSE → Gateway → Orchestrator → Registry / Plugin
                                           ↘ Model / Store / Policy / Cache
```

| 路径                            | 职责                                             |
| ------------------------------- | ------------------------------------------------ |
| `harness/core/`                 | 会话编排、注册、权限、确认、事件、缓存与运行追踪 |
| `harness/adapters/`             | 内存存储、演示模型与 OpenAI 兼容模型             |
| `harness/plugins/workbench.ts`  | 示例工具和 `@note:ID` 上下文提供者               |
| `harness/browser/`              | 当前浏览器的会话边界、宿主配置与 SSE 编码        |
| `lib/harness/runtime.ts`        | Next.js Cookie 身份与进程内运行时注册            |
| `app/harness/`                  | Server Component 页面和会话、确认、停止操作      |
| `app/api/harness/chat/route.ts` | `POST` 消息流                                    |
| `components/harness/`           | 对话、输入、确认、能力列表和运行记录             |
| `types/harness.ts`              | 界面共享类型，从 `types/index.ts` 导出           |
| `harness/nextpier.json`         | CLI 集成标记                                     |
| `nextpier.config.json`          | `features.harness` 导航开关                      |

核心不依赖 Next.js、数据库或股票业务。它输出类型化事件，由 SSE 适配器发送到界面；消息解析使用 `eventsource-parser`。源码出处见生成后的 `harness/ORIGIN.md`。

## 接入业务能力

在 `harness/plugins/` 增加插件，将其注册到 `harness/browser/runtime.ts` 的 `plugins`，并同步更新 `allowedTools`。工具参数在 handler 内使用 Zod 校验。

`HarnessPlugin` 下的 Skill 可以提供 `tools`、可调用 `agents` 和 `contextProviders`。注册名称必须唯一。`@note:ID` 是上下文解析示例；业务可换成工单、客户或文档引用。

只读工具设置 `permission: 'read'`；写入用 `write`，删除用 `destructive`。后两者强制人工确认，宿主未提供确认处理器时拒绝执行。工具在展示给模型时和实际执行前均检查权限。

自定义运行时沿用以下接口：

```ts
import { HarnessGateway } from '@/harness/core';

const gateway = new HarnessGateway({
  config: { model: 'your-model', maxIterations: 8, maxTokens: 2048 },
  model: yourModel,
  store: yourStore,
  plugins: [yourPlugin],
  policy: { authorize: (tool, sessionId) => canUseTool(tool, sessionId) },
  tracePayloads: false,
});
```

`yourModel`、`yourStore`、`yourPlugin`、`canUseTool` 由业务提供。核心接口为 `HarnessModel`、`HarnessStore`、`HarnessToolPolicy` 和 `HarnessCacheStore`；前端只引用类型与事件，不导入模型适配器。

## 会话边界

默认通过随机 HttpOnly Cookie 隔离浏览器会话；消息流还校验 Origin 与会话归属。Server Actions 负责新建、读取、删除、确认和停止。工具确认仍属于授权浏览器的操作，不代替业务鉴权。

当前模板使用内存存储：会话、便签、日志及待确认状态在进程重启后丢失。每个浏览器最多 40 个会话，示例便签最多 100 条；单次运行最多 8 轮、120 秒。日志默认不记录模型和工具载荷。

公开业务应用需要将浏览器示例身份替换为现有登录用户，并在业务工具和存储层校验权限。需要历史记录时替换 Store，数据写入 `NEXTPIER_DATA_DIR` 或数据库；同一活动会话的请求须到同一进程，多实例部署需要共享运行状态与确认通道。

## 与 Wails 一起使用

两种升级可独立执行，也可叠加：

```bash
npm run upgrade:harness
npm run upgrade:wails -- --name MyApp --id com.example.myapp
```

桌面客户端继续通过本地 Next.js 处理 Server Actions 和 SSE。桌面模型配置写入应用用户配置目录的 `.env.local`，路径见 [桌面指南](desktop.md)。默认内存会话同样随应用退出丢失。

## 验证

基础仓库：

```bash
npm run test:cli
npm run test:harness-template
```

第二条命令在临时目录安装测试所需的 SDK 与解析器，生成完整工程，执行 TypeScript、ESLint 和核心、模型适配器、SSE 测试。需要 npm 缓存或网络；不启动 Next.js、不请求真实模型，结束后清理临时目录。

已升级的业务项目：

```bash
npm run typecheck
npm run lint
npm run test:harness
```

测试覆盖写入确认、取消与停止、权限拒绝、会话归属、缓存隔离、流式事件和生成冲突。浏览器界面、真实模型连通性和 Wails 原生窗口仍需分别验收。

[建项 Prompt](ai-agent.md) · [开发指南](development.md) · [文档目录](README.md)
