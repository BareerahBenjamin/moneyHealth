"""股票数据服务 - 使用 akshare 腾讯数据源（兼容海外服务器）"""
import akshare as ak
import pandas as pd


def _symbol(code: str) -> str:
    """6位代码 -> 腾讯格式 sz000858 / sh600519"""
    code = code.strip()
    if code.startswith(('6', '9')):
        return f"sh{code}"
    return f"sz{code}"


# 缓存股票名称表
_name_cache = None


def _load_name_map():
    global _name_cache
    if _name_cache is not None:
        return _name_cache
    try:
        df = ak.stock_info_a_code_name()
        if df is not None and not df.empty:
            df.columns = [c.strip().lower() for c in df.columns]
            if "code" in df.columns and "name" in df.columns:
                _name_cache = dict(zip(
                    df["code"].astype(str),
                    df["name"].astype(str).str.replace(" ", "", regex=False)
                ))
                return _name_cache
    except Exception:
        pass
    _name_cache = {}
    return _name_cache


def get_stock_info(code: str) -> dict:
    """获取单只股票基础信息和近期行情"""
    try:
        code = code.strip()
        symbol = _symbol(code)

        # 拉取日K线 — 腾讯源（qt.gtimg.cn）
        df = ak.stock_zh_a_hist_tx(
            symbol=symbol,
            start_date="20240101",
            end_date="20500101",
        )

        if df is None or df.empty:
            return {"error": f"未找到股票 {code}"}

        for col in ["open", "close", "high", "low", "amount"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        # 取最近 30 个交易日
        df = df.tail(30).reset_index(drop=True)

        if df.empty:
            return {"error": f"股票 {code} 无历史数据"}

        latest = df.iloc[-1]
        prev_close = df.iloc[-2]["close"] if len(df) >= 2 else latest["close"]

        # 当日涨跌幅
        daily_change = round(float((latest["close"] - prev_close) / prev_close * 100), 2) if prev_close > 0 else 0

        # 30 日收益率
        if len(df) >= 2:
            start_close = df.iloc[0]["close"]
            end_close = df.iloc[-1]["close"]
            period_return = round((end_close - start_close) / start_close * 100, 2) if start_close > 0 else 0
        else:
            period_return = 0

        # 30 日波动率（日收益率标准差）
        if len(df) >= 5:
            daily_returns = df["close"].pct_change().dropna() * 100
            volatility = round(float(daily_returns.std()), 2) if len(daily_returns) > 1 else 0
        else:
            volatility = 0

        # 股票名称
        name_map = _load_name_map()
        name = name_map.get(code, f"股票{code}")

        return {
            "code": code,
            "name": name,
            "latest_price": round(float(latest["close"]), 2),
            "latest_date": str(latest["date"]),
            "daily_change": daily_change,
            "period_return_30d": period_return,
            "volatility_30d": volatility,
            "price_history": [
                {
                    "date": str(row["date"]),
                    "close": round(float(row["close"]), 2),
                    "change_pct": round(
                        float((row["close"] - df.iloc[max(0, i - 1)]["close"]) / df.iloc[max(0, i - 1)]["close"] * 100), 2
                    ) if i > 0 else 0,
                }
                for i, (_, row) in enumerate(df.iterrows())
            ],
        }
    except Exception as e:
        return {"error": f"获取股票 {code} 数据失败：{str(e)}"}


def search_stock(keyword: str) -> list:
    """搜索股票"""
    try:
        name_map = _load_name_map()
        results = []
        for code, name in name_map.items():
            if keyword in name or keyword in code:
                results.append({"code": code, "name": name})
                if len(results) >= 10:
                    break
        return results
    except Exception:
        return []
