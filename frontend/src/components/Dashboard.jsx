import styles from './Dashboard.module.css'

export default function Dashboard({ analysis, onRefresh, onSelectHolding }) {
  if (!analysis) return (
    <div className={styles.empty}>
      <div className={styles.emptyTitle}>还没有数据</div>
      <div className={styles.emptyDesc}>先去「录入持仓」添加你的基金和加密货币吧</div>
    </div>
  )
  if (analysis.loading) return <div className={styles.loading}>正在获取最新数据</div>
  if (analysis.error) return <div className={styles.loading}>出错了：{analysis.error}</div>

  const { funds, cryptos, stocks, summary } = analysis

  return (
    <div>
      <div className={styles.totalSection}>
        <div className={styles.totalLabel}>
          总 资 产
          <button className={styles.refreshBtn} onClick={onRefresh} title="刷新数据">↻</button>
        </div>
        <div className={styles.totalValue}>¥ {((summary.total_fund_value_cny || 0) + (summary.total_stock_value_cny || 0)).toLocaleString()}</div>
        <div className={styles.breakdown}>
          <div className={styles.breakdownItem}>
            <div className={styles.breakdownLabel}>基金</div>
            <div className={styles.breakdownValue}>¥{(summary.total_fund_value_cny || 0).toLocaleString()}</div>
          </div>
          <div className={styles.divider} />
          <div className={styles.breakdownItem}>
            <div className={styles.breakdownLabel}>股票</div>
            <div className={styles.breakdownValue}>¥{(summary.total_stock_value_cny || 0).toLocaleString()}</div>
          </div>
          <div className={styles.divider} />
          <div className={styles.breakdownItem}>
            <div className={styles.breakdownLabel}>加密</div>
            <div className={styles.breakdownValue}>${(summary.total_crypto_value_usd || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className={styles.holdingsGrid}>
        {funds && funds.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>基 金</div>
            {funds.map((f, i) => {
              if (f.error) return (
                <div className={styles.holdingItem} key={i}>
                  <span className={styles.holdingName}>{f.code}</span>
                  <span className={styles.negative}>{f.error}</span>
                </div>
              )
              return (
                <div
                  className={styles.holdingItem}
                  key={i}
                  onClick={() => onSelectHolding({ type: 'fund', code: f.code, amount: f.holding_amount, data: f })}
                >
                  <div className={styles.holdingLeft}>
                    <div>
                      <div className={styles.holdingName}>{f.name || f.code}</div>
                      <div className={styles.holdingSub}>净值 {f.latest_nav} · {f.latest_date}</div>
                    </div>
                  </div>
                  <div className={styles.holdingRight}>
                    <div className={styles.holdingValue}>¥{f.holding_amount?.toLocaleString()}</div>
                    <div className={`${styles.holdingChange} ${f.period_return_30d >= 0 ? styles.positive : styles.negative}`}>
                      30天 {f.period_return_30d > 0 ? '+' : ''}{f.period_return_30d}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {cryptos && cryptos.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>加 密 货 币</div>
            {cryptos.map((c, i) => {
              if (c.error) return (
                <div className={styles.holdingItem} key={i}>
                  <span className={styles.holdingName}>{c.symbol}</span>
                  <span className={styles.negative}>{c.error}</span>
                </div>
              )
              return (
                <div
                  className={styles.holdingItem}
                  key={i}
                  onClick={() => onSelectHolding({ type: 'crypto', symbol: c.symbol, amount: c.holding_amount, data: c })}
                >
                  <div className={styles.holdingLeft}>
                    <div>
                      <div className={styles.holdingName}>{c.name} ({c.symbol})</div>
                      <div className={styles.holdingSub}>${c.price_usd?.toLocaleString()} · 排名 #{c.market_cap_rank}</div>
                    </div>
                  </div>
                  <div className={styles.holdingRight}>
                    <div className={styles.holdingValue}>${c.value_usd?.toLocaleString()}</div>
                    <div className={`${styles.holdingChange} ${c.price_change_24h >= 0 ? styles.positive : styles.negative}`}>
                      24h {c.price_change_24h > 0 ? '+' : ''}{c.price_change_24h}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {stocks && stocks.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>股 票</div>
            {stocks.map((s, i) => {
              if (s.error) return (
                <div className={styles.holdingItem} key={i}>
                  <span className={styles.holdingName}>{s.code}</span>
                  <span className={styles.negative}>{s.error}</span>
                </div>
              )
              return (
                <div
                  className={styles.holdingItem}
                  key={i}
                  onClick={() => onSelectHolding({ type: 'stock', code: s.code, amount: s.holding_amount, data: s })}
                >
                  <div className={styles.holdingLeft}>
                    <div>
                      <div className={styles.holdingName}>{s.name || s.code}</div>
                      <div className={styles.holdingSub}>¥{s.latest_price} · {s.latest_date}</div>
                    </div>
                  </div>
                  <div className={styles.holdingRight}>
                    <div className={styles.holdingValue}>¥{s.holding_amount?.toLocaleString()}</div>
                    <div className={`${styles.holdingChange} ${s.period_return_30d >= 0 ? styles.positive : styles.negative}`}>
                      30天 {s.period_return_30d > 0 ? '+' : ''}{s.period_return_30d}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
