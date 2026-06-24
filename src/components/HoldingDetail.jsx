import { useState, useEffect, useMemo } from 'react'
import { getFundInfo, getCryptoHistory, getCryptoDetail, getStockInfo } from '../api'
import styles from './HoldingDetail.module.css'

function MiniChart({ data, width = 600, height = 160 }) {
  if (!data || data.length < 2) return null

  const padding = { top: 10, right: 10, bottom: 24, left: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value - min) / range) * chartH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    y: padding.top + chartH * (1 - pct),
    value: min + range * pct,
  }))

  const labels = [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]]

  return (
    <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {gridLines.map((g, i) => (
        <g key={i}>
          <line className={styles.chartGrid} x1={padding.left} y1={g.y} x2={width - padding.right} y2={g.y} />
        </g>
      ))}
      <path className={styles.chartArea} d={areaPath} />
      <path className={styles.chartLine} d={linePath} />
      <circle className={styles.chartDot} cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" />
      {labels.map((l, i) => {
        const idx = data.indexOf(l)
        return (
          <text
            key={i}
            className={styles.chartLabel}
            x={padding.left + (idx / (data.length - 1)) * chartW}
            y={height - 4}
            textAnchor="middle"
          >
            {l.label}
          </text>
        )
      })}
    </svg>
  )
}

export default function HoldingDetail({ holding, onBack }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true)
      try {
        if (holding.type === 'fund') {
          const data = await getFundInfo(holding.code)
          setDetail(data)
        } else if (holding.type === 'stock') {
          const data = await getStockInfo(holding.code)
          setDetail(data)
        } else {
          const [detailData, historyData] = await Promise.all([
            getCryptoDetail(holding.symbol),
            getCryptoHistory(holding.symbol, 30),
          ])
          setDetail({ ...detailData, history: historyData })
        }
      } catch (e) {
        setDetail({ error: e.message })
      }
      setLoading(false)
    }
    fetchDetail()
  }, [holding])

  const chartData = useMemo(() => {
    if (!detail) return null
    if (holding.type === 'fund' && detail.nav_history) {
      return detail.nav_history.map(h => ({
        label: h.date.slice(5),
        value: h.nav,
      }))
    }
    if (holding.type === 'stock' && detail.price_history) {
      return detail.price_history.map(h => ({
        label: h.date.slice(5),
        value: h.close,
      }))
    }
    if (holding.type === 'crypto' && detail.history && detail.history.prices) {
      return detail.history.prices.map(p => ({
        label: new Date(p.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        value: p.price,
      }))
    }
    return null
  }, [detail, holding.type])

  if (loading) return <div className={styles.loading}>加载中...</div>
  if (!detail || detail.error) return <div className={styles.loading}>出错了：{detail?.error || '未知错误'}</div>

  const isFund = holding.type === 'fund'
  const isStock = holding.type === 'stock'
  const isCrypto = holding.type === 'crypto'

  const currentValue = isCrypto
    ? `$ ${(detail.price_usd * holding.amount).toLocaleString()}`
    : `¥ ${holding.amount.toLocaleString()}`

  const returnPct = isCrypto ? detail.price_change_30d : detail.period_return_30d

  const displayName = isFund ? (detail.name || detail.code) : detail.name
  const displayCode = isFund ? detail.code : (isStock ? detail.code : detail.symbol)
  const displayPrice = isFund
    ? `¥ ${detail.latest_nav}`
    : isStock
      ? `¥ ${detail.latest_price}`
      : `$ ${detail.price_usd?.toLocaleString()}`

  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={onBack}>← 返回看板</button>
      <div className={styles.header}>
        <div className={styles.name}>{displayName}</div>
        <div className={styles.code}>{displayCode}</div>
        <div className={styles.value}>{displayPrice}</div>
        <div className={`${styles.change} ${returnPct >= 0 ? styles.positive : styles.negative}`}>
          {returnPct >= 0 ? '+' : ''}{returnPct}% (30天)
        </div>
      </div>
      {chartData && (
        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>30 天 走 势</div>
          <MiniChart data={chartData} />
        </div>
      )}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>持有金额</div>
          <div className={styles.statValue}>{currentValue}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>30日收益</div>
          <div className={`${styles.statValue} ${returnPct >= 0 ? styles.positive : styles.negative}`}>
            {returnPct >= 0 ? '+' : ''}{returnPct}%
          </div>
        </div>
        {(isFund || isStock) && (
          <>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>波动率</div>
              <div className={styles.statValue}>{detail.volatility_30d}%</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{isFund ? '最新净值' : '最新价'}</div>
              <div className={styles.statValue}>{isFund ? detail.latest_nav : detail.latest_price}</div>
            </div>
          </>
        )}
        {isCrypto && (
          <>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>24h 变化</div>
              <div className={`${styles.statValue} ${detail.price_change_24h >= 0 ? styles.positive : styles.negative}`}>
                {detail.price_change_24h >= 0 ? '+' : ''}{detail.price_change_24h}%
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>距最高点</div>
              <div className={`${styles.statValue} ${styles.negative}`}>
                {detail.ath_change_pct}%
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
