import { useState, useEffect } from 'react'
import { getTrades, addTrade, getTradeStats, getTradePnl } from '../api'
import styles from './TradeJournal.module.css'

const DIRECTIONS = [
  { value: 'buy', label: '买入' },
  { value: 'sell', label: '卖出' },
  { value: 'add', label: '加仓' },
  { value: 'trim', label: '减仓' },
  { value: 'close', label: '平仓' },
]

const TICKER_TYPES = [
  { value: 'stock', label: 'A股' },
  { value: 'fund', label: '基金' },
  { value: 'crypto', label: '加密货币' },
]

const DIRECTION_LABELS = {
  buy: '买入', sell: '卖出', add: '加仓', trim: '减仓', close: '平仓'
}

const DIRECTION_COLORS = {
  buy: styles.buy, add: styles.buy,
  sell: styles.sell, trim: styles.sell, close: styles.sell,
}

export default function TradeJournal() {
  const [trades, setTrades] = useState([])
  const [stats, setStats] = useState(null)
  const [pnlData, setPnlData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState('list') // list | pnl

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    account: '',
    ticker: '',
    tickerType: 'stock',
    direction: 'buy',
    quantity: '',
    costPrice: '',
    currency: 'CNY',
    sourceFramework: '未归因',
    thesisId: '',
    notes: '',
  })

  const load = () => {
    setLoading(true)
    Promise.all([getTrades(), getTradeStats()])
      .then(([tradeData, statsData]) => {
        setTrades(tradeData.trades || [])
        setStats(statsData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const loadPnl = () => {
    setLoading(true)
    getTradePnl()
      .then(data => setPnlData(data.trades || []))
      .catch(() => setPnlData([]))
      .finally(() => setLoading(false))
  }

  const handleSubmit = async () => {
    if (!form.ticker.trim() || !form.quantity || !form.costPrice) {
      alert('请填写标的、数量和成本价')
      return
    }
    setSaving(true)
    try {
      await addTrade(form)
      setShowForm(false)
      setForm(f => ({ ...f, ticker: '', quantity: '', costPrice: '', notes: '' }))
      load()
    } catch (e) {
      alert('录入失败: ' + e.message)
    }
    setSaving(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.sectionLabel}>交 易 日 志</div>
      <p className={styles.description}>
        记录每笔交易的成本价、来源框架，积累复盘数据。
      </p>

      {/* 统计卡片 */}
      {stats && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalTrades}</div>
            <div className={styles.statLabel}>总交易数</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {Object.keys(stats.byTicker || {}).length}
            </div>
            <div className={styles.statLabel}>涉及标的</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {Object.keys(stats.byFramework || {}).length}
            </div>
            <div className={styles.statLabel}>来源框架</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              ¥{(stats.totalAmount || 0).toLocaleString()}
            </div>
            <div className={styles.statLabel}>总金额</div>
          </div>
        </div>
      )}

      {/* 视图切换 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${view === 'list' ? styles.tabActive : ''}`}
          onClick={() => setView('list')}
        >
          交易记录
        </button>
        <button
          className={`${styles.tab} ${view === 'pnl' ? styles.tabActive : ''}`}
          onClick={() => { setView('pnl'); loadPnl() }}
        >
          盈亏一览
        </button>
      </div>

      {/* 操作栏 */}
      <div className={styles.actions}>
        <button className={styles.createBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '收起表单' : '+ 记一笔'}
        </button>
      </div>

      {/* 录入表单 */}
      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>日期</label>
              <input className={styles.input} type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>账户</label>
              <input className={styles.input} value={form.account}
                onChange={e => setForm(f => ({ ...f, account: e.target.value }))}
                placeholder="如 FUTU / 支付宝" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>标的类型</label>
              <select className={styles.input} value={form.tickerType}
                onChange={e => setForm(f => ({ ...f, tickerType: e.target.value }))}>
                {TICKER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>标的代码</label>
              <input className={styles.input} value={form.ticker}
                onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))}
                placeholder="如 600519 / BTC" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>方向</label>
              <select className={styles.input} value={form.direction}
                onChange={e => setForm(f => ({ ...f, direction: e.target.value }))}>
                {DIRECTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>数量</label>
              <input className={styles.input} type="number" value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="股数 / 份数 / 币数" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>成本价</label>
              <input className={styles.input} type="number" value={form.costPrice}
                onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))}
                placeholder="成交单价" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>货币</label>
              <select className={styles.input} value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="CNY">CNY</option>
                <option value="USD">USD</option>
                <option value="HKD">HKD</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>来源框架</label>
            <input className={styles.input} value={form.sourceFramework}
              onChange={e => setForm(f => ({ ...f, sourceFramework: e.target.value }))}
              placeholder="framework:xxx / 直觉 / 消息 / 未归因" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>备注</label>
            <input className={styles.input} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="可选备注" />
          </div>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? '录入中...' : '确认录入'}
          </button>
        </div>
      )}

      {/* 列表视图 */}
      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : view === 'list' ? (
        <div className={styles.section}>
          {trades.length === 0 ? (
            <div className={styles.empty}>暂无交易记录，点击"记一笔"开始录入</div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>日期</span>
                <span>标的</span>
                <span>方向</span>
                <span>数量</span>
                <span>成本价</span>
                <span>金额</span>
                <span>来源框架</span>
              </div>
              {trades.map((t, i) => (
                <div key={i} className={styles.tableRow}>
                  <span className={styles.cellDate}>{t.date}</span>
                  <span className={styles.cellTicker}>
                    {t.ticker}
                    <span className={styles.tickerType}>
                      {t.tickerType === 'stock' ? '股' : t.tickerType === 'fund' ? '基' : '币'}
                    </span>
                  </span>
                  <span className={`${styles.cellDirection} ${DIRECTION_COLORS[t.direction] || ''}`}>
                    {DIRECTION_LABELS[t.direction] || t.direction}
                  </span>
                  <span>{t.quantity}</span>
                  <span>{t.costPrice}</span>
                  <span>¥{(t.amount || 0).toLocaleString()}</span>
                  <span className={styles.cellFramework}>{t.sourceFramework}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 盈亏视图 */
        <div className={styles.section}>
          {pnlData.length === 0 ? (
            <div className={styles.empty}>暂无交易记录</div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>标的</span>
                <span>方向</span>
                <span>成本价</span>
                <span>现价</span>
                <span>盈亏</span>
                <span>盈亏%</span>
              </div>
              {pnlData.map((t, i) => (
                <div key={i} className={styles.tableRow}>
                  <span className={styles.cellTicker}>{t.ticker}</span>
                  <span className={`${styles.cellDirection} ${DIRECTION_COLORS[t.direction] || ''}`}>
                    {DIRECTION_LABELS[t.direction] || t.direction}
                  </span>
                  <span>{t.costPrice}</span>
                  <span>{t.currentPrice ?? '—'}</span>
                  <span className={t.pnl >= 0 ? styles.profit : styles.loss}>
                    {t.pnl !== null ? `¥${t.pnl.toLocaleString()}` : '—'}
                  </span>
                  <span className={t.pnlPct >= 0 ? styles.profit : styles.loss}>
                    {t.pnlPct !== null ? `${t.pnlPct}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
