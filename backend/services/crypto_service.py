"""加密货币数据服务 - 使用 CoinGecko 免费 API"""
import requests
import time

COINGECKO_BASE = "https://api.coingecko.com/api/v3"

# 缓存：{symbol: {"data": {...}, "timestamp": time.time()}}
_price_cache: dict = {}
_detail_cache: dict = {}
CACHE_TTL = 120  # 缓存 2 分钟

# 常用币种 ID 映射
COIN_MAP = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "DOGE": "dogecoin",
    "ADA": "cardano",
    "XRP": "ripple",
    "BNB": "binancecoin",
    "DOT": "polkadot",
    "AVAX": "avalanche-2",
    "MATIC": "matic-network",
    "LINK": "chainlink",
    "UNI": "uniswap",
    "LTC": "litecoin",
    "ATOM": "cosmos",
    "FIL": "filecoin",
    "ARB": "arbitrum",
    "OP": "optimism",
}

def get_crypto_price(symbols: list[str]) -> dict:
    """获取多个币种的实时价格（带缓存）"""
    now = time.time()
    s_upper_list = [s.upper() for s in symbols]

    # 检查缓存
    cached = {}
    uncached = []
    for sym in s_upper_list:
        if sym in _price_cache and now - _price_cache[sym]["timestamp"] < CACHE_TTL:
            cached[sym] = _price_cache[sym]["data"]
        else:
            uncached.append(sym)

    if not uncached:
        return cached

    # 将用户输入的符号转为 CoinGecko ID
    ids = []
    symbol_to_id = {}
    for s in uncached:
        coin_id = COIN_MAP.get(s, s.lower())
        ids.append(coin_id)
        symbol_to_id[s] = coin_id

    try:
        resp = requests.get(f"{COINGECKO_BASE}/simple/price", params={
            "ids": ",".join(ids),
            "vs_currencies": "usd",
            "include_24hr_change": "true",
            "include_market_cap": "true",
        }, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        for sym, coin_id in symbol_to_id.items():
            if coin_id in data:
                result = {
                    "price_usd": data[coin_id]["usd"],
                    "change_24h": round(data[coin_id].get("usd_24h_change", 0), 2),
                    "market_cap": data[coin_id].get("usd_market_cap", 0),
                }
                _price_cache[sym] = {"data": result, "timestamp": now}
                cached[sym] = result
            else:
                cached[sym] = {"error": f"未找到币种 {sym}"}
        return cached
    except Exception as e:
        return {"error": f"获取加密货币数据失败：{str(e)}"}

def get_crypto_history(symbol: str, days: int = 30) -> dict:
    """获取币种历史价格"""
    coin_id = COIN_MAP.get(symbol.upper(), symbol.lower())
    try:
        resp = requests.get(f"{COINGECKO_BASE}/coins/{coin_id}/market_chart", params={
            "vs_currency": "usd",
            "days": days,
        }, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        prices = data.get("prices", [])
        return {
            "symbol": symbol.upper(),
            "prices": [{"timestamp": p[0], "price": p[1]} for p in prices]
        }
    except Exception as e:
        return {"error": f"获取 {symbol} 历史数据失败：{str(e)}"}

def get_crypto_detail(symbol: str) -> dict:
    """获取币种详细信息（带缓存）"""
    sym = symbol.upper()
    now = time.time()

    # 检查缓存
    if sym in _detail_cache and now - _detail_cache[sym]["timestamp"] < CACHE_TTL:
        return _detail_cache[sym]["data"]

    coin_id = COIN_MAP.get(sym, symbol.lower())
    try:
        resp = requests.get(f"{COINGECKO_BASE}/coins/{coin_id}", params={
            "localization": "false",
            "tickers": "false",
            "community_data": "false",
            "developer_data": "false",
        }, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        market = data.get("market_data", {})
        result = {
            "symbol": sym,
            "name": data.get("name", ""),
            "price_usd": market.get("current_price", {}).get("usd", 0),
            "ath": market.get("ath", {}).get("usd", 0),
            "ath_change_pct": round(market.get("ath_change_percentage", {}).get("usd", 0), 2),
            "market_cap_rank": data.get("market_cap_rank", 0),
            "price_change_24h": round(market.get("price_change_percentage_24h", 0), 2),
            "price_change_7d": round(market.get("price_change_percentage_7d", 0), 2),
            "price_change_30d": round(market.get("price_change_percentage_30d", 0), 2),
        }
        _detail_cache[sym] = {"data": result, "timestamp": now}
        return result
    except Exception as e:
        return {"error": f"获取 {symbol} 详情失败：{str(e)}"}
