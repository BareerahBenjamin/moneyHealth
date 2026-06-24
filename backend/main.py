"""我的钱还好吗？ - FastAPI 后端"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from services.fund_service import get_fund_info
from services.crypto_service import get_crypto_price, get_crypto_detail
from services.stock_service import get_stock_info
from services.llm_service import generate_health_report, explain_concept, verify_claims, analyze_supply_chain
from services.wiki_service import get_index, get_entry, save_entry, delete_entry, list_entries, search_entries, get_log, add_log
from services.trade_service import get_trades, add_trade, get_trade_stats, get_pnl

load_dotenv()

app = FastAPI(title="我的钱还好吗？", version="1.0.0")

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 数据模型 ==========

class FundHolding(BaseModel):
    code: str          # 基金代码
    amount: float      # 持有金额（元）
    cost: Optional[float] = None  # 成本价（可选）

class CryptoHolding(BaseModel):
    symbol: str        # 币种符号，如 BTC, ETH
    amount: float      # 持有数量
    cost_usd: Optional[float] = None  # 买入均价（美元，可选）

class StockHolding(BaseModel):
    code: str          # 股票代码，如 000001, 600519
    amount: float      # 持有金额（元）
    cost: Optional[float] = None  # 成本价（可选）

class PortfolioRequest(BaseModel):
    funds: list[FundHolding] = []
    cryptos: list[CryptoHolding] = []
    stocks: list[StockHolding] = []

class ConceptRequest(BaseModel):
    concept: str

class ClaimRequest(BaseModel):
    content: str      # 待核实的消息/研报/小作文原文

class MaterialRequest(BaseModel):
    material: str               # 原材料/金属/矿产名称，如 稀土、锂、高纯石英砂
    context: Optional[str] = "" # 可选：用户想验证的逻辑/背景

# ========== API 路由 ==========

@app.get("/")
def root():
    return {"message": "我的钱还好吗？ - API 服务运行中"}

@app.get("/api/health")
def health():
    return {"status": "ok", "llm_configured": bool(os.getenv("LLM_API_KEY"))}

# ----- 基金接口 -----

@app.get("/api/fund/{fund_code}")
def api_get_fund(fund_code: str):
    """获取单只基金数据"""
    return get_fund_info(fund_code)

@app.get("/api/fund/search/{keyword}")
def api_search_fund(keyword: str):
    """搜索基金"""
    from services.fund_service import search_fund
    return {"results": search_fund(keyword)}

# ----- 加密货币接口 -----

@app.get("/api/crypto/price")
def api_crypto_price(symbols: str):
    """获取多个币种价格，symbols 逗号分隔，如 BTC,ETH,SOL"""
    symbol_list = [s.strip() for s in symbols.split(",")]
    return get_crypto_price(symbol_list)

@app.get("/api/crypto/{symbol}")
def api_crypto_detail(symbol: str):
    """获取币种详细信息"""
    return get_crypto_detail(symbol)

@app.get("/api/crypto/{symbol}/history")
def api_crypto_history(symbol: str, days: int = 30):
    """获取币种历史价格"""
    from services.crypto_service import get_crypto_history
    return get_crypto_history(symbol, days)

# ----- 股票接口 -----

@app.get("/api/stock/{stock_code}")
def api_get_stock(stock_code: str):
    """获取单只股票数据"""
    return get_stock_info(stock_code)

@app.get("/api/stock/search/{keyword}")
def api_search_stock(keyword: str):
    """搜索股票"""
    from services.stock_service import search_stock
    return {"results": search_stock(keyword)}

# ----- 投资组合分析 -----

@app.post("/api/analyze")
def api_analyze_portfolio(portfolio: PortfolioRequest):
    """分析投资组合，返回数据汇总"""
    fund_results = []
    total_fund_value = 0
    for f in portfolio.funds:
        info = get_fund_info(f.code)
        if "error" not in info:
            info["holding_amount"] = f.amount
            total_fund_value += f.amount
        fund_results.append(info)

    crypto_results = []
    total_crypto_value_usd = 0
    if portfolio.cryptos:
        price_data = get_crypto_price([c.symbol for c in portfolio.cryptos])
        for c in portfolio.cryptos:
            detail = get_crypto_detail(c.symbol)
            if "error" not in detail:
                current_price = detail.get("price_usd", 0)
                value_usd = current_price * c.amount
                total_crypto_value_usd += value_usd
                detail["holding_amount"] = c.amount
                detail["value_usd"] = round(value_usd, 2)
                detail["price_change_24h"] = detail.get("price_change_24h", 0)
            crypto_results.append(detail)

    stock_results = []
    total_stock_value = 0
    for s in portfolio.stocks:
        info = get_stock_info(s.code)
        if "error" not in info:
            info["holding_amount"] = s.amount
            total_stock_value += s.amount
        stock_results.append(info)

    return {
        "funds": fund_results,
        "cryptos": crypto_results,
        "stocks": stock_results,
        "summary": {
            "total_fund_value_cny": total_fund_value,
            "total_crypto_value_usd": total_crypto_value_usd,
            "total_stock_value_cny": total_stock_value,
            "fund_count": len([f for f in fund_results if "error" not in f]),
            "crypto_count": len([c for c in crypto_results if "error" not in c]),
            "stock_count": len([s for s in stock_results if "error" not in s]),
        }
    }

# ----- AI 报告 -----

@app.post("/api/report")
def api_generate_report(portfolio: PortfolioRequest):
    """生成 AI 体检报告"""
    # 先获取数据
    analysis = api_analyze_portfolio(portfolio)
    
    # 构造给 LLM 的摘要
    fund_lines = []
    for f in analysis["funds"]:
        if "error" not in f:
            fund_lines.append(
                f"- 基金{f['code']}：持有{f['holding_amount']}元，"
                f"最新净值{f['latest_nav']}，近30天收益{f.get('period_return_30d', 'N/A')}%，"
                f"波动率{f.get('volatility_30d', 'N/A')}%"
            )
    
    crypto_lines = []
    for c in analysis["cryptos"]:
        if "error" not in c:
            crypto_lines.append(
                f"- {c['symbol']}（{c['name']}）：持有{c['holding_amount']}个，"
                f"现价${c['price_usd']}，24h变化{c.get('price_change_24h', 0)}%，"
                f"距历史最高点{c.get('ath_change_pct', 'N/A')}%"
            )

    stock_lines = []
    for s in analysis.get("stocks", []):
        if "error" not in s:
            stock_lines.append(
                f"- {s['code']}（{s['name']}）：持有{s['holding_amount']}元，"
                f"最新价{s['latest_price']}，近30天收益{s.get('period_return_30d', 'N/A')}%，"
                f"波动率{s.get('volatility_30d', 'N/A')}%"
            )

    portfolio_text = "### 基金持仓\n" + ("\n".join(fund_lines) if fund_lines else "无") + \
                     "\n\n### 加密货币持仓\n" + ("\n".join(crypto_lines) if crypto_lines else "无") + \
                     "\n\n### 股票持仓\n" + ("\n".join(stock_lines) if stock_lines else "无") + \
                     f"\n\n### 总计\n基金约 {analysis['summary']['total_fund_value_cny']} 元，加密货币约 ${analysis['summary']['total_crypto_value_usd']}，股票约 {analysis['summary'].get('total_stock_value_cny', 0)} 元"
    
    market_text = f"数据获取时间：实时"
    
    report = generate_health_report(portfolio_text, market_text)
    
    return {
        "report": report,
        "data": analysis
    }

# ----- 教育模块 -----

@app.post("/api/explain")
def api_explain(req: ConceptRequest):
    """解释投资概念"""
    return {"explanation": explain_concept(req.concept)}

# ----- 谣言/研报验真（融合自 AlphaLoop）-----

@app.post("/api/verify")
def api_verify(req: ClaimRequest):
    """核实一段二手信息（小作文/研报/群消息）的真伪，返回核验矩阵"""
    return verify_claims(req.content)

# ----- 产业链分析（融合自 AlphaLoop strategic-materials）-----

@app.post("/api/supply-chain")
def api_supply_chain(req: MaterialRequest):
    """对某原材料/金属跑五层漏斗产业链分析，受益标的现取实时价"""
    return analyze_supply_chain(req.material, req.context or "")

# ========== 研究知识库（OpenOrder）==========

VALID_WIKI_TYPES = ("companies", "industries", "frameworks")

@app.get("/api/wiki/index")
def api_wiki_index():
    """获取研究知识库主索引"""
    return get_index()

@app.get("/api/wiki/search")
def api_wiki_search(q: str):
    """搜索研究知识库"""
    return {"results": search_entries(q)}

@app.get("/api/wiki/log")
def api_wiki_log(limit: int = 20):
    """获取活动日志"""
    return {"log": get_log(limit)}

@app.get("/api/wiki/{entry_type}")
def api_wiki_list(entry_type: str):
    """列出某类条目（companies/industries/frameworks）"""
    if entry_type not in VALID_WIKI_TYPES:
        return {"error": f"不支持的类型: {entry_type}"}
    return {"entries": list_entries(entry_type)}

@app.get("/api/wiki/{entry_type}/{entry_id}")
def api_wiki_get(entry_type: str, entry_id: str):
    """获取单个条目详情"""
    if entry_type not in VALID_WIKI_TYPES:
        return {"error": f"不支持的类型: {entry_type}"}
    entry = get_entry(entry_type, entry_id)
    if entry is None:
        return {"error": "未找到"}
    return entry

@app.post("/api/wiki/{entry_type}/{entry_id}")
def api_wiki_save(entry_type: str, entry_id: str, data: dict):
    """创建或更新条目"""
    if entry_type not in VALID_WIKI_TYPES:
        return {"error": f"不支持的类型: {entry_type}"}
    result = save_entry(entry_type, entry_id, data)
    return result

@app.delete("/api/wiki/{entry_type}/{entry_id}")
def api_wiki_delete(entry_type: str, entry_id: str):
    """删除条目"""
    if entry_type not in VALID_WIKI_TYPES:
        return {"error": f"不支持的类型: {entry_type}"}
    ok = delete_entry(entry_type, entry_id)
    return {"ok": ok}

# ========== 交易日志 ==========

@app.get("/api/trades")
def api_get_trades(ticker: str = None, from_date: str = None, to_date: str = None):
    """获取交易列表"""
    return {"trades": get_trades(ticker, from_date, to_date)}

@app.post("/api/trades")
def api_add_trade(trade: dict):
    """添加交易"""
    result = add_trade(trade)
    return result

@app.get("/api/trades/stats")
def api_trade_stats():
    """获取交易统计"""
    return get_trade_stats()

@app.get("/api/trades/pnl")
def api_trade_pnl():
    """计算盈亏"""
    return {"trades": get_pnl()}

# ========== 静态文件（前端）==========

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """SPA catch-all: 返回 index.html 或静态文件"""
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

# ----- 启动 -----

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
