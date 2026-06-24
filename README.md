# 我的钱还好吗？

> 你的投资组合健康吗？让 AI 帮你看看。

一个面向投资新手的中文理财助手，帮你追踪基金、A 股、加密货币持仓，用 AI 分析投资健康度，还能验真传言、分析产业链。

**🔗 前端：** [moneyhealth.pages.dev](https://moneyhealth.pages.dev)  

---

## 功能

### 📊 数据看板
录入持仓后，一键查看所有资产的实时行情、涨跌幅、波动率。基金数据来自 akshare，A 股来自东方财富，加密货币来自 CoinGecko。

### 🩺 AI 体检报告
基于你的实际持仓数据，AI 生成个性化的投资组合健康分析。报告中的金融术语可以点击即时解释。

### 🔍 谣言验真
粘贴研报摘要、群消息、小作文，AI 会交叉核实：提取关键主张 → 查找市场证据 → 给出可信度判断。

### 🔗 产业链分析
输入一种原材料（如稀土、锂），AI 会进行五层漏斗分析，找出上下游受益标的。

### 📚 研究知识库
建立自己的投资研究笔记：公司分析、行业研究、投资框架，支持搜索和分类管理。

### 📒 交易日志
记录每笔买卖操作，自动计算盈亏，支持按时间和标的筛选。

### 📖 每日一学
首页每天推送一条投资小知识，教育页面有 30+ 个常见概念可点击学习。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite 8 + CSS Modules |
| 后端 | Python 3.9 + FastAPI + Uvicorn |
| 数据 | JSON 文件存储 |
| AI | OpenAI 兼容 API（vectorengine.ai） |
| 数据源 | akshare（基金）、东方财富（A 股）、CoinGecko（加密货币） |
| 前端托管 | Cloudflare Pages |
| 后端托管 | Fly.io |

---

## 本地开发

### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 创建 .env 文件
cat > .env << EOF
LLM_BASE_URL=https://api.vectorengine.ai/v1
LLM_API_KEY=你的API密钥
LLM_MODEL=gpt-5-codex
EOF

python main.py
# 启动在 http://localhost:8000
```

### 前端

```bash
cd frontend
npm install
npm run dev
# 启动在 http://localhost:5173
```

前端开发模式会连接 `localhost:8000` 的后端。

---

## 部署

### 后端 → Fly.io

```bash
fly deploy

# 设置环境变量
fly secrets set LLM_BASE_URL=https://api.vectorengine.ai/v1
fly secrets set LLM_API_KEY=你的密钥
fly secrets set LLM_MODEL=gpt-5-codex
fly secrets set CORS_ORIGINS="https://moneyhealth.pages.dev,http://localhost:5173"
```

### 前端 → Cloudflare Pages

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name moneyhealth
```

或者连接 GitHub 仓库，push 后自动部署。

---

## 项目结构

```
├── backend/
│   ├── main.py                # FastAPI 路由 + Pydantic 模型
│   ├── requirements.txt
│   ├── Dockerfile
│   └── services/
│       ├── fund_service.py    # 基金数据（akshare）
│       ├── stock_service.py   # A 股数据（东方财富 API）
│       ├── crypto_service.py  # 加密货币（CoinGecko）
│       ├── llm_service.py     # AI 功能（报告/验真/产业链）
│       ├── wiki_service.py    # 研究知识库
│       └── trade_service.py   # 交易日志
├── frontend/
│   ├── src/
│   │   ├── api.js             # 后端接口封装
│   │   ├── App.jsx            # 主应用 + 页面路由
│   │   ├── components/        # 各页面组件
│   │   └── styles/tokens.css  # 设计令牌（颜色/间距/字体）
│   └── public/
├── docs/                      # AlphaLoop 方法论文档
└── fly.toml                   # Fly.io 部署配置
```

---

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `LLM_BASE_URL` | LLM API 地址 | ✅ |
| `LLM_API_KEY` | LLM API 密钥 | ✅ |
| `LLM_MODEL` | 使用的模型名称 | ✅ |
| `CORS_ORIGINS` | 允许的前端域名（逗号分隔） | 生产环境必填 |
| `DATA_DIR` | 数据存储目录 | 可选，默认 `./data` |

---

## 致谢

- [AlphaLoop](https://github.com/realnaka/alphaloop) — 产业链分析和传言验真功能基于 AlphaLoop 方法论
- [akshare](https://github.com/akfamily/akshare) — 中国金融数据接口
- [CoinGecko API](https://www.coingecko.com/api) — 加密货币数据

---

## License

MIT
