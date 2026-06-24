# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"我的钱还好吗？" (Is my money okay?) — A Chinese-language personal finance app for investment beginners to track fund, stock, and crypto holdings, view dashboards, get AI-generated health reports, verify investment claims, analyze supply chains, maintain a research wiki, and log trades.

## Common Commands

### Backend (Python 3.9 / FastAPI)
```bash
source backend/venv/bin/activate
python backend/main.py          # Starts uvicorn on 0.0.0.0:8000
pip install -r backend/requirements.txt
```

### Frontend (React 19 / Vite 8)
```bash
cd frontend
npm run dev       # Dev server on port 5173
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Running the Full Stack
Start backend on port 8000 first, then frontend on port 5173. The frontend hardcodes `http://localhost:8000` as the backend URL (in `src/api.js`). CORS allows `localhost:5173` and `localhost:3000`.

## Architecture

Two independent sub-projects (`backend/` and `frontend/`) with no shared root-level config, no monorepo tooling, and no test framework set up.

### Backend (`backend/`)
- **FastAPI** with service-layer pattern under `services/`
- `main.py` is the single-file router containing all API endpoints and Pydantic models
- `fund_service.py` — Chinese mutual fund data via `akshare`
- `stock_service.py` — A-share stock data via East Money REST APIs (not akshare)
- `crypto_service.py` — Crypto prices via CoinGecko REST API
- `llm_service.py` — All LLM-powered features via OpenAI-compatible API (vectorengine.ai):
  - `generate_health_report()` — AI portfolio health report
  - `explain_concept()` — Financial concept Q&A
  - `verify_claims()` — Claim/rumor verification (entity extraction → real-time market evidence → LLM cross-check with structured JSON output)
  - `analyze_supply_chain()` — Five-layer funnel supply chain analysis for strategic materials
- `wiki_service.py` — File-based CRUD for a research knowledge base (companies, industries, frameworks) stored as flat JSON under `backend/data/wiki/`
- `trade_service.py` — Trade journal with CRUD, filtering, stats, and live PnL calculation (fetches current prices from other services)
- Config via `.env` (LLM_BASE_URL, LLM_API_KEY, LLM_MODEL) loaded with `python-dotenv`
- All persistence is flat JSON files under `backend/data/` (no database)

### Frontend (`frontend/`)
- SPA with client-side routing via `useState` (no router library) — pages: input, dashboard, report, factcheck, supplychain, wiki, journal, education, plus a holding detail view
- Page components: `PortfolioInput.jsx`, `Dashboard.jsx`, `Report.jsx`, `Education.jsx`, `FactCheck.jsx`, `SupplyChain.jsx`, `Wiki.jsx`, `WikiDetail.jsx`, `TradeJournal.jsx`, `HoldingDetail.jsx`
- Shared UI components: `DailyTip.jsx`, `TermExplainer.jsx`
- `src/api.js` centralizes all backend fetch calls; API modules are lazy-loaded via `import('./api')` on page navigation
- Styling: CSS Modules (`.module.css` per component) + design tokens in `src/styles/tokens.css` (light warm theme, no CSS framework)
- `src/utils/highlightTerms.js` — utility for highlighting financial terms in text

### Key API Routes (backend/main.py)
- `GET /api/fund/{code}`, `GET /api/fund/search/{keyword}`
- `GET /api/stock/{code}`, `GET /api/stock/search/{keyword}`
- `GET /api/crypto/price?symbols=BTC,ETH`, `GET /api/crypto/{symbol}`, `GET /api/crypto/{symbol}/history`
- `POST /api/analyze` — Portfolio analysis (funds + stocks + cryptos)
- `POST /api/report` — AI-generated health report
- `POST /api/explain` — Explain a financial concept
- `POST /api/verify` — Verify investment claims/rumors (returns structured JSON with claim labels)
- `POST /api/supply-chain` — Five-layer supply chain analysis for strategic materials
- `GET/POST/DELETE /api/wiki/{type}/{id}`, `GET /api/wiki/index`, `GET /api/wiki/search`, `GET /api/wiki/log`
- `GET/POST /api/trades`, `GET /api/trades/stats`, `GET /api/trades/pnl`

### Docs
- `docs/alphaloop/` — AlphaLoop methodology and skill definitions (claim verification, supply chain analysis, etc.)
- `docs/superpowers/` — Frontend redesign plan and design spec
