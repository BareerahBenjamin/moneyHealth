"""交易日志服务 — 结构化记录交易、计算盈亏"""
import json
import os
import uuid
from datetime import datetime
from typing import List, Dict, Optional

DATA_DIR = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(os.path.dirname(__file__)), "data"))
TRADES_FILE = os.path.join(DATA_DIR, "trades.json")


def _read_trades() -> List[dict]:
    """读取全部交易记录"""
    try:
        with open(TRADES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _write_trades(trades: List[dict]):
    """写入全部交易记录"""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(TRADES_FILE, "w", encoding="utf-8") as f:
        json.dump(trades, f, ensure_ascii=False, indent=2)


def get_trades(ticker: str = None, from_date: str = None, to_date: str = None) -> List[dict]:
    """获取交易列表，支持筛选"""
    trades = _read_trades()

    if ticker:
        ticker_upper = ticker.upper()
        trades = [t for t in trades if t.get("ticker", "").upper() == ticker_upper]

    if from_date:
        trades = [t for t in trades if t.get("date", "") >= from_date]

    if to_date:
        trades = [t for t in trades if t.get("date", "") <= to_date]

    return trades


def add_trade(trade_data: dict) -> dict:
    """添加一笔交易"""
    trades = _read_trades()

    trade = {
        "id": str(uuid.uuid4())[:8],
        "date": trade_data.get("date", datetime.now().strftime("%Y-%m-%d")),
        "account": trade_data.get("account", ""),
        "ticker": trade_data.get("ticker", "").upper(),
        "tickerType": trade_data.get("tickerType", "stock"),  # stock / fund / crypto
        "direction": trade_data.get("direction", "buy"),  # buy / sell / add / trim / close
        "quantity": float(trade_data.get("quantity", 0)),
        "costPrice": float(trade_data.get("costPrice", 0)),
        "currency": trade_data.get("currency", "CNY"),
        "amount": 0,
        "sourceFramework": trade_data.get("sourceFramework", "未归因"),
        "thesisId": trade_data.get("thesisId", ""),
        "notes": trade_data.get("notes", ""),
        "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    # 计算金额
    trade["amount"] = round(trade["quantity"] * trade["costPrice"], 2)

    trades.append(trade)
    _write_trades(trades)

    return trade


def get_trade_stats() -> dict:
    """获取交易统计"""
    trades = _read_trades()

    if not trades:
        return {
            "totalTrades": 0,
            "totalAmount": 0,
            "byTicker": {},
            "byDirection": {},
            "byFramework": {}
        }

    total_amount = sum(t.get("amount", 0) for t in trades)

    # 按标的统计
    by_ticker = {}
    for t in trades:
        key = t.get("ticker", "未知")
        if key not in by_ticker:
            by_ticker[key] = {"count": 0, "totalAmount": 0, "tickerType": t.get("tickerType", "stock")}
        by_ticker[key]["count"] += 1
        by_ticker[key]["totalAmount"] += t.get("amount", 0)

    # 按方向统计
    by_direction = {}
    for t in trades:
        key = t.get("direction", "未知")
        by_direction[key] = by_direction.get(key, 0) + 1

    # 按来源框架统计
    by_framework = {}
    for t in trades:
        key = t.get("sourceFramework", "未归因")
        by_framework[key] = by_framework.get(key, 0) + 1

    return {
        "totalTrades": len(trades),
        "totalAmount": round(total_amount, 2),
        "byTicker": by_ticker,
        "byDirection": by_direction,
        "byFramework": by_framework
    }


def get_pnl() -> List[dict]:
    """计算每笔交易的盈亏（需要调用实时价格服务）"""
    from services.stock_service import get_stock_info
    from services.fund_service import get_fund_info
    from services.crypto_service import get_crypto_detail

    trades = _read_trades()
    results = []

    for trade in trades:
        ticker = trade.get("ticker", "")
        ticker_type = trade.get("tickerType", "stock")
        cost_price = trade.get("costPrice", 0)
        quantity = trade.get("quantity", 0)
        direction = trade.get("direction", "buy")

        current_price = None
        price_error = None

        try:
            if ticker_type == "stock":
                info = get_stock_info(ticker)
                if "error" not in info:
                    current_price = info.get("latest_price")
                else:
                    price_error = info.get("error")
            elif ticker_type == "fund":
                info = get_fund_info(ticker)
                if "error" not in info:
                    current_price = info.get("latest_nav")
                else:
                    price_error = info.get("error")
            elif ticker_type == "crypto":
                info = get_crypto_detail(ticker)
                if "error" not in info:
                    current_price = info.get("price_usd")
                else:
                    price_error = info.get("error")
        except Exception as e:
            price_error = str(e)

        pnl = None
        pnl_pct = None
        if current_price is not None and cost_price > 0:
            if direction in ("buy", "add"):
                pnl = round((current_price - cost_price) * quantity, 2)
                pnl_pct = round((current_price - cost_price) / cost_price * 100, 2)
            elif direction in ("sell", "trim", "close"):
                pnl = round((cost_price - current_price) * quantity, 2)
                pnl_pct = round((cost_price - current_price) / cost_price * 100, 2)

        results.append({
            **trade,
            "currentPrice": current_price,
            "priceError": price_error,
            "pnl": pnl,
            "pnlPct": pnl_pct
        })

    return results
