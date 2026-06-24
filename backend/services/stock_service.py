"""股票数据服务 - 使用东方财富 API 获取 A 股数据"""
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

EASTMONEY_KLINE = "https://push2his.eastmoney.com/api/qt/stock/kline/get"
EASTMONEY_SPOT = "https://push2.eastmoney.com/api/qt/clist/get"

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://quote.eastmoney.com/",
}

def _make_session():
    """创建带重试的 requests session"""
    s = requests.Session()
    retries = Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504])
    s.mount("https://", HTTPAdapter(max_retries=retries))
    s.headers.update(_HEADERS)
    return s

def _secid(code: str) -> str:
    """根据股票代码生成 secid（东方财富格式）"""
    if code.startswith(('6', '9')):
        return f"1.{code}"  # 上海
    return f"0.{code}"  # 深圳


def get_stock_info(code: str) -> dict:
    """获取单只股票基础信息和近期行情"""
    try:
        secid = _secid(code)
        session = _make_session()
        resp = session.get(EASTMONEY_KLINE, params={
            "secid": secid,
            "klt": "101",       # 日K
            "fqt": "1",         # 前复权
            "beg": "20200101",  # 足够长的历史
            "end": "20500101",
            "fields1": "f1,f2,f3,f4,f5,f6",
            "fields2": "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
            "ut": "7eea3edcaed734bea9cbfc24409ed989",
        }, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        if data.get("rc") != 0 or not data.get("data"):
            return {"error": f"未找到股票 {code}"}

        stock_data = data["data"]
        name = stock_data.get("name", f"股票{code}")
        klines = stock_data.get("klines", [])

        if not klines:
            return {"error": f"股票 {code} 无历史数据"}

        # 解析K线数据：日期,开盘,收盘,最高,最低,成交量,成交额,振幅,涨跌幅,涨跌额,换手率
        parsed = []
        for line in klines:
            parts = line.split(",")
            parsed.append({
                "date": parts[0],
                "open": float(parts[1]),
                "close": float(parts[2]),
                "high": float(parts[3]),
                "low": float(parts[4]),
                "volume": int(parts[5]),
                "amount": float(parts[6]),
                "amplitude": float(parts[7]),
                "change_pct": float(parts[8]),
                "change": float(parts[9]),
                "turnover": float(parts[10]),
            })

        latest = parsed[-1]
        history_30d = parsed[-30:] if len(parsed) >= 30 else parsed

        # 计算30日收益率
        if len(history_30d) >= 2:
            start_close = history_30d[0]["close"]
            end_close = history_30d[-1]["close"]
            period_return = round((end_close - start_close) / start_close * 100, 2)
        else:
            period_return = 0

        # 计算30日波动率（日收益率的标准差）
        if len(history_30d) >= 5:
            daily_returns = []
            for i in range(1, len(history_30d)):
                prev = history_30d[i - 1]["close"]
                curr = history_30d[i]["close"]
                if prev > 0:
                    daily_returns.append((curr - prev) / prev * 100)
            import statistics
            volatility = round(statistics.stdev(daily_returns), 2) if len(daily_returns) > 1 else 0
        else:
            volatility = 0

        return {
            "code": code,
            "name": name,
            "latest_price": latest["close"],
            "latest_date": latest["date"],
            "daily_change": latest["change_pct"],
            "period_return_30d": period_return,
            "volatility_30d": volatility,
            "price_history": [
                {"date": h["date"], "close": h["close"], "change_pct": h["change_pct"]}
                for h in history_30d
            ],
        }
    except Exception as e:
        return {"error": f"获取股票 {code} 数据失败：{str(e)}"}


def search_stock(keyword: str) -> list:
    """搜索股票（通过东方财富实时行情接口）"""
    try:
        session = _make_session()
        resp = session.get(EASTMONEY_SPOT, params={
            "pn": "1",
            "pz": "10",
            "po": "1",
            "np": "1",
            "ut": "bd1d9ddb04089700cf9c27f6f7426281",
            "fltt": "2",
            "invt": "2",
            "fid": "f3",
            "fs": "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23",  # A股
            "fields": "f12,f14",  # 代码,名称
            "kw": keyword,
        }, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        results = []
        for item in (data.get("data", {}).get("diff", []) or []):
            results.append({
                "code": item.get("f12", ""),
                "name": item.get("f14", ""),
            })
        return results
    except Exception as e:
        return []
