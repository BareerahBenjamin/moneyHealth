import { useState } from 'react'
import PortfolioInput from './components/PortfolioInput'
import Dashboard from './components/Dashboard'
import Report from './components/Report'
import Education from './components/Education'
import FactCheck from './components/FactCheck'
import SupplyChain from './components/SupplyChain'
import HoldingDetail from './components/HoldingDetail'
import Wiki from './components/Wiki'
import TradeJournal from './components/TradeJournal'
import styles from './components/App.module.css'

function App() {
  const [page, setPage] = useState('input')
  const [portfolio, setPortfolio] = useState({ funds: [], cryptos: [], stocks: [] })
  const [analysis, setAnalysis] = useState(null)
  const [report, setReport] = useState(null)
  const [selectedHolding, setSelectedHolding] = useState(null)

  const navItems = [
    { key: 'input', label: '录入持仓' },
    { key: 'dashboard', label: '数据看板' },
    { key: 'report', label: 'AI 体检' },
    { key: 'factcheck', label: '谣言验真' },
    { key: 'supplychain', label: '产业链' },
    { key: 'wiki', label: '知识库' },
    { key: 'journal', label: '交易日志' },
    { key: 'education', label: '学一学' },
  ]

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => setPage('input')}>
          <span className={styles.logoText}>我的钱还好吗？</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`${styles.navItem} ${page === item.key ? styles.navItemActive : ''}`}
              disabled={item.key !== 'input' && item.key !== 'education' && item.key !== 'factcheck' && item.key !== 'supplychain' && item.key !== 'wiki' && item.key !== 'journal' && portfolio.funds.length + portfolio.cryptos.length + portfolio.stocks.length === 0}
              onClick={() => {
                if (item.key === 'dashboard') {
                  if (!analysis && portfolio.funds.length + portfolio.cryptos.length + portfolio.stocks.length > 0) {
                    setAnalysis({ loading: true })
                    setPage('dashboard')
                    import('./api').then(({ analyzePortfolio }) => analyzePortfolio(portfolio)).then(setAnalysis).catch(e => setAnalysis({ error: e.message }))
                  } else {
                    setPage('dashboard')
                  }
                } else if (item.key === 'report') {
                  if (!report && portfolio.funds.length + portfolio.cryptos.length + portfolio.stocks.length > 0) {
                    setReport({ loading: true })
                    setPage('report')
                    import('./api').then(({ generateReport }) => generateReport(portfolio)).then(setReport).catch(e => setReport({ error: e.message }))
                  } else {
                    setPage('report')
                  }
                } else {
                  setPage(item.key)
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        {page === 'input' && (
          <PortfolioInput
            portfolio={portfolio}
            setPortfolio={setPortfolio}
            onAnalyze={async (p) => {
              setAnalysis({ loading: true })
              setPage('dashboard')
              try {
                const { analyzePortfolio } = await import('./api')
                const data = await analyzePortfolio(p)
                setAnalysis(data)
              } catch (e) {
                setAnalysis({ error: e.message })
              }
            }}
            onReport={async (p) => {
              setReport({ loading: true })
              setPage('report')
              try {
                const { generateReport } = await import('./api')
                const data = await generateReport(p)
                setReport(data)
              } catch (e) {
                setReport({ error: e.message })
              }
            }}
          />
        )}
        {page === 'dashboard' && (
          <Dashboard
            analysis={analysis}
            onRefresh={async () => {
              setAnalysis({ loading: true })
              try {
                const { analyzePortfolio } = await import('./api')
                const data = await analyzePortfolio(portfolio)
                setAnalysis(data)
              } catch (e) {
                setAnalysis({ error: e.message })
              }
            }}
            onSelectHolding={(holding) => {
              setSelectedHolding(holding)
              setPage('detail')
            }}
          />
        )}
        {page === 'report' && (
          <Report
            report={report}
            onRefresh={async () => {
              setReport({ loading: true })
              try {
                const { generateReport } = await import('./api')
                const data = await generateReport(portfolio)
                setReport(data)
              } catch (e) {
                setReport({ error: e.message })
              }
            }}
          />
        )}
        {page === 'factcheck' && <FactCheck />}
        {page === 'supplychain' && <SupplyChain />}
        {page === 'wiki' && <Wiki />}
        {page === 'journal' && <TradeJournal />}
        {page === 'education' && <Education portfolio={portfolio} report={report} />}
        {page === 'detail' && selectedHolding && (
          <HoldingDetail
            holding={selectedHolding}
            onBack={() => setPage('dashboard')}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>投资有风险，入市需谨慎。本工具仅供学习参考，不构成投资建议。</p>
      </footer>
    </div>
  )
}

export default App
