# GitHub 发布

## 名称与描述

展示名用 **NextPier**，仓库名用 `nextpier`，短句用 `Web first. Desktop next.`。

GitHub About 描述与 `package.json.description` 保持一致：

```text
Next.js starter for workbench apps. Add a Wails desktop app in one command, with AnimateIcons, Cult UI, and Server Actions.
```

中文介绍：

```text
面向工作台的 Next.js 模板，内置 AnimateIcons、Cult UI 和紧凑样式。一条命令升级 Wails 桌面应用，保留 Server Actions。
```

Topics：

```text
nextjs react typescript tailwindcss wails desktop-app starter-template animateicons cult-ui shadcn-ui
```

## 仓库更名

目前 GitHub 仓库仍使用 `yayapao/mynextjs`，文档安装命令与界面链接保持可用的地址。

在 GitHub Settings 中将 Repository name 改为 `nextpier` 后，同步 README 的两个语言版本、`docs/development.md`、`package.json.repository` 和 `lib/metadata.ts` 中的仓库地址，再更新本地 remote：

```bash
git remote set-url origin git@github.com:yayapao/nextpier.git
```

在 About 中填写上述描述和 Topics。README 保留中文入口，`README.en.md` 为英文入口；两者的命令保持一致。

更名后，桌面配置继续使用 `MYNEXTJS_*` 和 `desktop/mynextjs.json`，不迁移已有用户数据。

[文档目录](README.md)
