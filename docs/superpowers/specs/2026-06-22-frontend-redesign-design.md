# Frontend Redesign: MUJI 暖调日系风格 + 功能改进

## Overview

将当前"AI 暗黑风格"前端重设计为 MUJI 暖调日系风格——克制、温暖、有呼吸感。采用 CSS Modules + 设计系统方案，建立统一 token 体系，样式拆分到各组件模块中。同时新增两个功能：持仓详情页、报告内嵌教育。

## 设计方向

关键词：插画风、高级感、日系。参考无印良品的视觉语言——暖色调、大量留白、克制排版、圆形元素。

## Design Tokens

### 颜色

```css
/* 背景 */
--bg-primary: #f8f5f0;      /* 暖米，主背景 */
--bg-card: #ffffff;           /* 卡片白 */
--bg-secondary: #f0ebe3;     /* 次级背景，图标底色 */

/* 文字 */
--text-primary: #3d3429;     /* 深棕，主文字 */
--text-secondary: #8a7a6a;   /* 中棕，次要文字 */
--text-tertiary: #b0a090;    /* 弱文字，标签 */

/* 强调 */
--accent: #3d3429;           /* 按钮主色，深棕 */
--accent-hover: #2d2419;     /* 按钮 hover */
--green: #5a8a5e;            /* 收益正 */
--red: #c07060;              /* 收益负 */

/* 边框 */
--border-light: #e8e0d4;
--border-medium: #d4c8b8;
```

### 间距

4px 基础单位。常用值：`8 / 12 / 16 / 20 / 24 / 32`。

### 圆角

- 小元素：`8px`
- 卡片：`12px`
- Pill 按钮：`24px`

### 字体

```css
font-family: -apple-system, 'Noto Sans SC', 'Hiragino Sans', sans-serif;
```

字重：`300`（大数字）、`500`（正文）、`600`（标题）。不使用 `700`。

### 阴影

极淡或不用。靠背景色差区分层级。

## 组件结构

### CSS Modules 拆分

| 组件 | CSS Module 文件 | 职责 |
|------|----------------|------|
| `App.jsx` | `App.module.css` | 全局布局、header、footer、导航 indicator |
| `PortfolioInput.jsx` | `PortfolioInput.module.css` | 输入表单、快捷标签、pill 按钮 |
| `Dashboard.jsx` | `Dashboard.module.css` | 资产概览、持仓列表、收益数字 |
| `Report.jsx` | `Report.module.css` | 虚线便签纸报告区 |
| `Education.jsx` | `Education.module.css` | 概念卡片、问答展开 |

### Token 文件

新增 `src/styles/tokens.css`，所有 CSS 变量集中定义，各模块通过 `@import` 或 `composes` 引用。

## 各页面设计

### Header

- Logo：🌱 替换 💰，更日系自然感
- Logo 文字去掉渐变色，改为纯 `#3d3429`
- 导航按钮：去掉圆角药丸背景，改为文字 + 底部短线 indicator（active 状态用 2px 棕色底线）
- 整体更扁平，减少视觉重量

### 录入持仓页

- 输入框：去掉边框，改为底部细线样式（`border-bottom: 1.5px solid #e8e0d4`），focus 时底线变 `#3d3429`
- 快捷添加按钮：改为带 `--bg-secondary` 底色的小标签，选中后变实心深棕
- 主按钮："查看数据" pill 样式，`--accent` 底色 + `--bg-primary` 文字
- 次按钮："AI 体检" pill 样式，`--border-medium` 边框 + `--text-primary` 文字
- 大量留白，区块间距 24-32px

### 数据看板

- 顶部总资产：32px 细体（`font-weight: 300`）数字居中
- 资产分类：横向三栏（基金 / 加密 / 收益），用竖线分隔
- 持仓列表：圆形图标（`--bg-secondary` 底色）+ 底部分割线，不用卡片边框
- 收益颜色：正 `--green`，负 `--red`，不用亮色荧光

### AI 体检

- 报告区域：虚线边框（`border: 1.5px dashed #d4c8b8`）+ 圆角 12px
- 文字行高 `1.8`，段间距 16px
- 数据摘要卡片：实线边框，与报告区形成对比

### 学一学

- 概念卡片：`--bg-secondary` 底色区块，圆角 12px
- 展开回答时加 `opacity` 淡入过渡（`transition: opacity 0.3s`）
- 保持极简，不加复杂交互

## 新增功能：持仓详情页

点击 Dashboard 中的任意持仓，进入详情视图。

### 布局

- 顶部：基金/币种名称 + 当前净值/价格，大号细体数字（MUJI 风格，`font-weight: 300`，`font-size: 28px`）
- 中间：历史走势折线图，30 天数据，用 SVG path 绘制，线条颜色 `--accent`，背景用 `--bg-secondary` 填充
- 下方：关键指标卡片网格（2x2）— 30 日收益率、波动率、持仓金额、盈亏
- 底部：返回按钮 pill 样式

### 数据来源（全部真实 API）

- 基金：复用 `backend/services/fund_service.py` 的 `get_fund_info`，返回 30 天净值历史
- 加密：复用 `backend/services/crypto_service.py`，返回 24h/7d/30d 变化数据

### 前端路由

在 `App.jsx` 中增加 `detail` 页面状态，传入当前选中的持仓对象（type + code/symbol + amount）。Dashboard 列表项可点击跳转。

### 组件

新增 `src/components/HoldingDetail.jsx` + `HoldingDetail.module.css`

### API 调用

- 基金详情：`GET /api/fund/{fund_code}` — 已有接口，返回 fund_info 含 history 数组
- 加密详情：`GET /api/crypto/{symbol}` — 已有接口，返回 price、ath、变化百分比

## 新增功能：报告内嵌教育

体检报告中出现的专业术语自动高亮，点击弹出 LLM 生成的通俗解释。

### 交互

- 报告文本中的预定义关键词（如"波动率"、"夏普比率"、"分散投资"）加虚线下划线（`border-bottom: 1px dashed --border-medium`）
- 点击关键词，下方展开一个 `--bg-secondary` 底色卡片，显示 LLM 生成的通俗解释
- 展开时加 `opacity` 淡入 + `max-height` 展开动画（`transition: opacity 0.3s, max-height 0.3s`）
- 同一关键词只解释一次，缓存结果；收起后可再次展开（从缓存读取，不重新请求）

### 关键词列表

前端维护一个基础集（10-15 个常见投资术语）：

```
波动率, 夏普比率, 分散投资, 净值, 回撤, 收益率,
年化, 仓位, 止损, 定投, 复利, 市盈率, 资产配置
```

### 后端

复用已有 `POST /api/explain` 接口，传入 `{ concept: "波动率" }`，返回 LLM 生成的解释文本。

### 前端实现

- 新增 `src/utils/highlightTerms.js` — 接收报告文本，用正则匹配关键词列表，返回带 `<span>` 标签的 JSX
- 修改 `Report.jsx` — 渲染报告时调用 highlightTerms，关键词 span 绑定点击事件
- 新增 `src/components/TermExplainer.jsx` — 展开式解释卡片组件

## 需要删除的文件

- `src/index.css`（Vite 样板 CSS，与新设计冲突）

## 不包含的内容

- 移动端响应式（后续单独做）
- 插画/手绘元素（后续可加 SVG 装饰）
- 暗色模式
