# GitHub 发布

## 名称与描述

展示名用 **NextPier**，仓库名用 `nextpier`，短句用 `Web first. Desktop next.`。

GitHub About 描述与 `package.json.description` 保持一致：

```text
Next.js workbench starter with AnimateIcons and Cult UI. Add a Wails desktop app or Browser Harness AI chat with one command.
```

中文介绍：

```text
面向工作台的 Next.js 模板，内置 AnimateIcons、Cult UI 和紧凑样式。通过 CLI 接入 Wails 桌面应用与 Browser Harness AI 对话，保留 Server Actions。
```

Topics：

```text
nextjs react typescript tailwindcss wails desktop-app starter-template animateicons cult-ui shadcn-ui browser-harness ai-agent
```

## 仓库地址

公开仓库：[yayapao/nextpier](https://github.com/yayapao/nextpier)。本地目录名为 `nextpier`，npm 包名同为 `nextpier`。

已有 checkout 可更新 remote：

```bash
git remote set-url origin git@github.com:yayapao/nextpier.git
```

在 About 中填写上述描述和 Topics。README 保留中文入口，`README.en.md` 为英文入口；两者的安装命令和建项 Prompt 保持一致。

新桌面工程使用 `NEXTPIER_*` 与 `desktop/nextpier.json`。旧工程兼容规则见 [桌面指南](desktop.md)。

[文档目录](README.md)
