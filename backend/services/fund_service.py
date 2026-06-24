"""基金数据服务 - 使用 akshare 获取中国公募基金数据"""
import akshare as ak
import warnings
warnings.filterwarnings('ignore')

def get_fund_info(fund_code: str) -> dict:
    """获取基金基础信息和近期净值"""
    try:
        # 获取历史净值数据
        df = ak.fund_open_fund_info_em(symbol=fund_code, indicator='单位净值走势')
        if df.empty:
            return {"error": f"未找到基金 {fund_code}"}
        
        latest = df.tail(1).iloc[0]
        history = df.tail(30)  # 近30天
        
        # 计算近30天收益率
        if len(history) >= 2:
            start_nav = history.iloc[0]['单位净值']
            end_nav = history.iloc[-1]['单位净值']
            period_return = round((end_nav - start_nav) / start_nav * 100, 2)
        else:
            period_return = 0
        
        # 计算波动率（近30天日收益率的标准差）
        if len(history) >= 5:
            daily_returns = history['日增长率'].dropna().values
            volatility = round(float(daily_returns.std()), 2) if len(daily_returns) > 1 else 0
        else:
            volatility = 0
        
        return {
            "code": fund_code,
            "name": f"基金{fund_code}",  # 后续可以补充基金名称
            "latest_nav": float(latest['单位净值']),
            "latest_date": str(latest['净值日期']),
            "daily_change": float(latest['日增长率']),
            "period_return_30d": period_return,
            "volatility_30d": volatility,
            "nav_history": [
                {"date": str(row['净值日期']), "nav": float(row['单位净值']), "change": float(row['日增长率'])}
                for _, row in history.iterrows()
            ]
        }
    except Exception as e:
        return {"error": f"获取基金 {fund_code} 数据失败：{str(e)}"}

def search_fund(keyword: str) -> list:
    """搜索基金"""
    try:
        df = ak.fund_open_fund_daily_em()
        # 简单搜索
        results = df[df['基金简称'].str.contains(keyword, na=False)].head(10)
        return [
            {"code": row['基金代码'], "name": row['基金简称'], "type": row['基金类型']}
            for _, row in results.iterrows()
        ]
    except Exception as e:
        return []
