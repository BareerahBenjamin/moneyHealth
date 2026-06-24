# 我的钱还好吗？

> 投资新手的个人财务健康助手 — 基金、股票、加密货币一站式管理

一个中文个人理财应用，帮助投资初学者追踪持仓、查看仪表盘、获取 AI 健康报告、验证投资传言、分析产业链，并维护自己的投资研究笔记。

## 功能一览

- **组合管理** — 录入基金、A 股、加密货币持仓，实时查看行情
- **仪表盘** — 可视化展示资产分布和收益概况
- **AI 体检报告** — 基于真实数据生成投资组合健康分析
- **传言验真** — 粘贴研报/群消息/小作文，AI 交叉核实真伪
- **产业链分析** — 输入原材料名称，五层漏斗分析受益标的
- **研究知识库** — 建立公司、行业、分析框架的研究笔记
- **交易日志** — 记录每笔交易，自动计算盈亏
- **每日一学** — 投资基础知识每日推送

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite 8 + CSS Modules |
| 后端 | Python 3.9 + FastAPI + Uvicorn |
| 数据 | JSON 文件存储（可扩展至 SQLite/数据库） |
| AI | OpenAI 兼容 API（vectorengine.ai） |
| 数据源 | akshare（基金）、东方财富（A 股）、CoinGecko（加密货币） |

## 快速开始

### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env  # 编辑填入 LLM 配置

python main.py        # 启动 http://localhost:8000
```

### 前端

```bash
cd frontend
npm install
npm run dev           # 启动 http://localhost:5173
```

浏览器打开 `http://localhost:5173` 即可使用。

## 项目结构

```
├── backend/
│   ├── main.py              # API 路由入口
│   ├── services/
│   │   ├── fund_service.py   # 基金数据
│   │   ├── stock_service.py  # A 股数据
│   │   ├── crypto_service.py # 加密货币数据
│   │   ├── llm_service.py    # AI 功能（报告/验真/产业链）
│   │   ├── wiki_service.py   # 研究知识库
│   │   └── trade_service.py  # 交易日志
│   └── data/                 # 持久化数据
├── frontend/
│   └── src/
│       ├── api.js            # 后端接口封装
│       ├── components/       # 页面组件
│       └── styles/tokens.css # 设计令牌
└── docs/                     # AlphaLoop 方法论文档
```

## 部署

支持 Cloudflare Pages（前端）+ Fly.io（后端）免费部署，详见代码中的 `Dockerfile` 和 `fly.toml`。

## 致谢

- [AlphaLoop](https://github.com/realnaka/alphaloop) — 本项目的产业链分析和传言验真功能基于 AlphaLoop 的方法论构建，感谢 [realnaka](https://github.com/realnaka) 的开源贡献
- [akshare](https://github.com/akfamily/akshare) — 中国金融数据接口
- [CoinGecko API](https://www.coingecko.com/api) — 加密货币数据

## License

MIT
