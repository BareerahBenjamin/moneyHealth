"""加密货币数据服务 - 使用 CoinGecko 免费 API"""
import requests

COINGECKO_BASE = "https://api.coingecko.com/api/v3"

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
    """获取多个币种的实时价格"""
    # 将用户输入的符号转为 CoinGecko ID
    ids = []
    symbol_to_id = {}
    for s in symbols:
        s_upper = s.upper()
        coin_id = COIN_MAP.get(s_upper, s.lower())
        ids.append(coin_id)
        symbol_to_id[s_upper] = coin_id
    
    try:
        resp = requests.get(f"{COINGECKO_BASE}/simple/price", params={
            "ids": ",".join(ids),
            "vs_currencies": "usd",
            "include_24hr_change": "true",
            "include_market_cap": "true",
        }, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        result = {}
        for sym, coin_id in symbol_to_id.items():
            if coin_id in data:
                result[sym] = {
                    "price_usd": data[coin_id]["usd"],
                    "change_24h": round(data[coin_id].get("usd_24h_change", 0), 2),
                    "market_cap": data[coin_id].get("usd_market_cap", 0),
                }
            else:
                result[sym] = {"error": f"未找到币种 {sym}"}
        return result
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
    """获取币种详细信息"""
    coin_id = COIN_MAP.get(symbol.upper(), symbol.lower())
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
        return {
            "symbol": symbol.upper(),
            "name": data.get("name", ""),
            "price_usd": market.get("current_price", {}).get("usd", 0),
            "ath": market.get("ath", {}).get("usd", 0),
            "ath_change_pct": round(market.get("ath_change_percentage", {}).get("usd", 0), 2),
            "market_cap_rank": data.get("market_cap_rank", 0),
            "price_change_24h": round(market.get("price_change_percentage_24h", 0), 2),
            "price_change_7d": round(market.get("price_change_percentage_7d", 0), 2),
            "price_change_30d": round(market.get("price_change_percentage_30d", 0), 2),
        }
    except Exception as e:
        return {"error": f"获取 {symbol} 详情失败：{str(e)}"}
