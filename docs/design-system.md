# 基础样式与组件

借鉴 Niu 的紧凑工作台：内容区不套卡片、标题与操作同一行、数据优先、中文短文案。Web 默认保持窄屏可用；Wails 默认窗口 1280 × 800，最小 800 × 560。

## 组件选择顺序

1. 图标优先 AnimateIcons；复杂视觉组件优先评估 Cult UI。
2. 表单、弹窗、菜单、Tab、Select、表格使用已有 shadcn/Radix 组件。
3. 缺少合适的动态图标时用 Lucide；通过 `lib/utils.ts` 的 `cn` 合并 class。

Cult UI 在 `components/ui/` 按源码保留，已有 Niu 适配版 `AnimatedNumber`、`TextureButton`、`MinimalCard`；许可证在 `cult-ui.LICENSE`。新增组件查阅 [Cult UI](https://www.cult-ui.com)，引入源码后适配本地 token，不依赖未经验证的在线 registry 地址。

## Token

颜色只在 `app/globals.css` 定义，组件使用 Tailwind 语义类。

| 用途                | 类名                                                            |
| ------------------- | --------------------------------------------------------------- |
| 页面                | `bg-background text-foreground`                                 |
| 条目与弹窗          | `bg-card`、`bg-popover`                                         |
| 辅助文本            | `text-muted-foreground`                                         |
| 边框/输入/焦点      | `border-border`、`border-input`、`ring-ring`                    |
| 成功/警告/信息/错误 | `text-success`、`text-warning`、`text-info`、`text-destructive` |
| 选中状态            | `text-control-active`                                           |
| 图表                | `chart-1` 至 `chart-5`，使用语义多色序列                        |
| 侧栏                | `bg-sidebar`、`bg-sidebar-accent`                               |

浅色与深色分别定义状态和图表 token。通用 starter 不引入 Niu 的股票盈亏规则、Agent 配置和数据库依赖。

## 尺寸与布局

| 项目                   | 默认值                                                  |
| ---------------------- | ------------------------------------------------------- |
| 工具栏                 | 48px                                                    |
| Input/Button/Select    | 32px，按钮支持 24/28/36px 和对应 icon 尺寸              |
| 基础圆角               | 6px，普通卡片不超过 8px                                 |
| 页面标题/正文/辅助文字 | 20px / 14px / 12px                                      |
| 间距                   | 4px 网格，常用 8/12/16/24px                             |
| 字间距                 | 0                                                       |
| 字体                   | 本机中文系统字体，等宽数字使用 `font-mono tabular-nums` |

弹窗默认使用 shadcn Dialog，可用 `sm:max-w-125`、`sm:max-w-180`、`sm:max-w-275` 设定宽度。页面内容加 `min-w-0`；长文本换行，表格区域允许独立横向滚动。

## 动画与图标

```tsx
'use client';
import { RefreshCwIcon } from '@animateicons/react/lucide/refresh-cw-icon';
import { AnimatedIconButton } from '@/components/ui/animated-icon-button';

<AnimatedIconButton
  icon={RefreshCwIcon}
  label="刷新"
  onClick={refresh}
  disabled={pending}
/>;
```

`AnimatedIconButton` 默认不循环，hover/focus 开始、leave/blur 停止；`label` 同时用于无障碍名称和 Tooltip。根 layout 已配置 `TooltipProvider` 和 `MotionConfig reducedMotion="user"`；组件和全局 CSS 也遵循减少动态效果设置。

```tsx
import { AnimatedNumber } from '@/components/ui/animated-number';
import { TextureButton } from '@/components/ui/texture-button';
import { MinimalCard, MinimalCardTitle } from '@/components/ui/minimal-card';

<AnimatedNumber value={total} precision={2} />
<TextureButton variant="primary" onClick={save}>保存</TextureButton>
<MinimalCard><MinimalCardTitle>{item.name}</MinimalCardTitle></MinimalCard>
```

卡片仅用于重复条目和需要独立框架的工具，不嵌套、不作为整页容器。

## 表单与示例

`components/ui/form.tsx` 提供 React Hook Form 适配，使用 `FormField`、`FormItem`、`FormLabel`、`FormControl` 和 `FormMessage`。Schema 使用 Zod，提交按钮显式 `variant="default"`。`Badge` 额外支持 `success`、`warning` 和 `info`。

首页 `FoundationWorkbench` 演示筛选、搜索、创建、完成、删除、校验、Dialog、状态 Badge、动态图标和动态数字。示例工作项只保存在当前 React 会话中，刷新恢复初始值；接入业务时替换为服务端读取和 Server Actions。

`ExampleConfigApi` 接收服务端读取的 `initialConfig`，展示兼容 `/api/config` 的交互写入。主题为项目/本机配置；多用户应用应改为按用户存储。共享类型从 `types/` 导出，旧 `lib/types/` 路径保留兼容。
