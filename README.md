# 福运环任务 · 交互原型

黄金岛游戏大厅「福运环任务」系统的前端交互原型，用于验证五环串联任务的核心交互流程与视觉设计方案。

## 在线体验

👉 [https://ringtask-qkudlpwp.manus.space/](https://ringtask-qkudlpwp.manus.space/)

## 原型覆盖的核心流程

| 流程 | 说明 |
|------|------|
| 大厅挂件 | 常驻右侧的「福运任务」入口，点击展开领取界面 |
| 领取任务 | 展示五环结构、大奖预览与规则说明，点击立即领取 |
| 任务详情 | 珠环进度、当前环任务卡、去完成按钮、大奖锚点条（含轮次与今日进度） |
| 替换任务 | 消耗金币替换当前进行中的环任务，展示替换前后对比确认弹窗 |
| 游戏模拟 | 模拟完成对局，触发环进度更新与完成反馈动效 |
| 轮终状态 | 五环全部完成后奖励自动发放，展示「开启下一轮」入口 |

## 设计风格

新中式赛博宫灯界面：深绛红主色 + 鎏金高光 + 发光珠环，强调游戏化任务系统的即时奖励感。

## 本地运行

```bash
pnpm install
pnpm dev
```

浏览器访问 `http://localhost:5173`

## 技术栈

- React 19 + TypeScript
- Vite + TailwindCSS v4
- Framer Motion（动画）
- Radix UI（基础组件）

## 相关文档

产品需求文档（内部飞书）：[福运环任务 PRD](https://ycnepdnc98ox.feishu.cn/docx/P4prdIRS4oNqu9xE5lXcLkhmn5c)
