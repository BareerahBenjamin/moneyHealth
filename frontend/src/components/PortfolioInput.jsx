import { useState } from 'react'
import styles from './PortfolioInput.module.css'
import DailyTip from './DailyTip'

const QUICK_FUNDS = [
  { code: '110011', name: '易方达中小盘' },
  { code: '161725', name: '招商中证白酒' },
  { code: '005827', name: '易方达蓝筹精选' },
  { code: '003834', name: '华夏能源革新' },
  { code: '001938', name: '中欧时代先锋' },
]

const QUICK_CRYPTOS = [
  { symbol: 'BTC', name: '比特币' },
  { symbol: 'ETH', name: '以太坊' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'DOGE', name: '狗狗币' },
]

const QUICK_STOCKS = [
  { code: '000001', name: '平安银行' },
  { code: '600519', name: '贵州茅台' },
  { code: '000858', name: '五粮液' },
  { code: '300750', name: '宁德时代' },
  { code: '600036', name: '招商银行' },
]

export default function PortfolioInput({ portfolio, setPortfolio, onAnalyze, onReport }) {
  const [fundCode, setFundCode] = useState('')
  const [fundAmount, setFundAmount] = useState('')
  const [cryptoSymbol, setCryptoSymbol] = useState('')
  const [cryptoAmount, setCryptoAmount] = useState('')
  const [stockCode, setStockCode] = useState('')
  const [stockAmount, setStockAmount] = useState('')

  const addFund = (code, name) => {
    const c = code || fundCode
    const a = fundAmount || '1000'
    if (!c) return
    setPortfolio(p => ({
      ...p,
      funds: [...p.funds, { code: c, amount: parseFloat(a), name: name || c }]
    }))
    setFundCode('')
    setFundAmount('')
  }

  const addCrypto = (symbol, name) => {
    const s = symbol || cryptoSymbol
    const a = cryptoAmount || '0.1'
    if (!s) return
    setPortfolio(p => ({
      ...p,
      cryptos: [...p.cryptos, { symbol: s.toUpperCase(), amount: parseFloat(a), name: name || s }]
    }))
    setCryptoSymbol('')
    setCryptoAmount('')
  }

  const removeFund = (index) => {
    setPortfolio(p => ({
      ...p,
      funds: p.funds.filter((_, i) => i !== index)
    }))
  }

  const removeCrypto = (index) => {
    setPortfolio(p => ({
      ...p,
      cryptos: p.cryptos.filter((_, i) => i !== index)
    }))
  }

  const addStock = (code, name) => {
    const c = code || stockCode
    const a = stockAmount || '10000'
    if (!c) return
    setPortfolio(p => ({
      ...p,
      stocks: [...p.stocks, { code: c, amount: parseFloat(a), name: name || c }]
    }))
    setStockCode('')
    setStockAmount('')
  }

  const removeStock = (index) => {
    setPortfolio(p => ({
      ...p,
      stocks: p.stocks.filter((_, i) => i !== index)
    }))
  }

  const hasData = portfolio.funds.length > 0 || portfolio.cryptos.length > 0 || portfolio.stocks.length > 0

  return (
    <div>
      <DailyTip />
      <div className={styles.sectionsGrid}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>基金</div>
        <p className={styles.description}>输入你买的基金，我们帮你看看它们的情况</p>

        <div className={styles.inputGroup}>
          <input
            className={styles.inputField}
            placeholder="基金代码，如 110011"
            value={fundCode}
            onChange={e => setFundCode(e.target.value)}
          />
          <input
            className={`${styles.inputField} ${styles.inputFieldNarrow}`}
            type="number"
            placeholder="持有金额（元）"
            value={fundAmount}
            onChange={e => setFundAmount(e.target.value)}
          />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => addFund()}>添加</button>
        </div>

        <div className={styles.quickAdd}>
          {QUICK_FUNDS.map(f => (
            <button key={f.code} className={styles.quickTag} onClick={() => addFund(f.code, f.name)}>
              + {f.name}
            </button>
          ))}
        </div>

        {portfolio.funds.length > 0 && (
          <div className={styles.holdingList}>
            {portfolio.funds.map((f, i) => (
              <div className={styles.holdingItem} key={i}>
                <div className={styles.holdingInfo}>
                  <span className={styles.holdingName}>{f.name || f.code}</span>
                  <span className={styles.holdingDetail}>代码 {f.code}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={styles.holdingValue}>¥{f.amount.toLocaleString()}</span>
                  <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeFund(i)}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>加密货币</div>
        <p className={styles.description}>输入你持有的加密货币，跟踪你的数字资产</p>

        <div className={styles.inputGroup}>
          <input
            className={styles.inputField}
            placeholder="币种，如 BTC, ETH"
            value={cryptoSymbol}
            onChange={e => setCryptoSymbol(e.target.value)}
          />
          <input
            className={`${styles.inputField} ${styles.inputFieldNarrow}`}
            type="number"
            step="0.01"
            placeholder="持有数量"
            value={cryptoAmount}
            onChange={e => setCryptoAmount(e.target.value)}
          />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => addCrypto()}>添加</button>
        </div>

        <div className={styles.quickAdd}>
          {QUICK_CRYPTOS.map(c => (
            <button key={c.symbol} className={styles.quickTag} onClick={() => addCrypto(c.symbol, c.name)}>
              + {c.name} ({c.symbol})
            </button>
          ))}
        </div>

        {portfolio.cryptos.length > 0 && (
          <div className={styles.holdingList}>
            {portfolio.cryptos.map((c, i) => (
              <div className={styles.holdingItem} key={i}>
                <div className={styles.holdingInfo}>
                  <span className={styles.holdingName}>{c.name || c.symbol}</span>
                  <span className={styles.holdingDetail}>{c.symbol}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={styles.holdingValue}>{c.amount} {c.symbol}</span>
                  <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeCrypto(i)}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>股票</div>
        <p className={styles.description}>输入你持有的 A 股股票，查看实时行情</p>

        <div className={styles.inputGroup}>
          <input
            className={styles.inputField}
            placeholder="股票代码，如 000001, 600519"
            value={stockCode}
            onChange={e => setStockCode(e.target.value)}
          />
          <input
            className={`${styles.inputField} ${styles.inputFieldNarrow}`}
            type="number"
            placeholder="持有金额（元）"
            value={stockAmount}
            onChange={e => setStockAmount(e.target.value)}
          />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => addStock()}>添加</button>
        </div>

        <div className={styles.quickAdd}>
          {QUICK_STOCKS.map(s => (
            <button key={s.code} className={styles.quickTag} onClick={() => addStock(s.code, s.name)}>
              + {s.name}
            </button>
          ))}
        </div>

        {portfolio.stocks.length > 0 && (
          <div className={styles.holdingList}>
            {portfolio.stocks.map((s, i) => (
              <div className={styles.holdingItem} key={i}>
                <div className={styles.holdingInfo}>
                  <span className={styles.holdingName}>{s.name || s.code}</span>
                  <span className={styles.holdingDetail}>{s.code}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={styles.holdingValue}>¥{s.amount.toLocaleString()}</span>
                  <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeStock(i)}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {hasData && (
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => onAnalyze(portfolio)}>
            查看数据
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => onReport(portfolio)}>
            AI 体检
          </button>
        </div>
      )}
    </div>
  )
}
