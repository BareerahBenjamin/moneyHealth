# Frontend Redesign: MUJI Theme + HoldingDetail + Inline Education

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the frontend from dark "AI style" to MUJI warm aesthetic with CSS Modules, add a holding detail page with SVG charts, and add inline term explanations in the AI report.

**Architecture:** CSS Modules per component with a shared tokens.css for design variables. New HoldingDetail component reuses existing backend APIs. Inline education uses a keyword-highlighting utility that wraps terms in clickable spans, calling the existing `/api/explain` endpoint.

**Tech Stack:** React 19, Vite 8, CSS Modules (built-in Vite support), SVG for charts, existing FastAPI backend

---

## File Structure

```
frontend/src/
├── styles/
│   └── tokens.css                    # NEW — design tokens (CSS variables)
├── utils/
│   └── highlightTerms.js             # NEW — keyword highlighting utility
├── components/
│   ├── App.module.css                # NEW — replaces App.css
│   ├── PortfolioInput.jsx            # MODIFY — CSS Module imports
│   ├── PortfolioInput.module.css     # NEW
│   ├── Dashboard.jsx                 # MODIFY — CSS Module + clickable items
│   ├── Dashboard.module.css          # NEW
│   ├── Report.jsx                    # MODIFY — CSS Module + inline terms
│   ├── Report.module.css             # NEW
│   ├── Education.jsx                 # MODIFY — CSS Module imports
│   ├── Education.module.css          # NEW
│   ├── HoldingDetail.jsx             # NEW — detail page with SVG chart
│   ├── HoldingDetail.module.css      # NEW
│   ├── TermExplainer.jsx             # NEW — expandable explanation card
│   └── TermExplainer.module.css      # NEW
├── App.jsx                           # MODIFY — CSS Modules, detail page state
├── api.js                            # MODIFY — add getCryptoHistory
├── main.jsx                          # MODIFY — remove index.css import
└── index.css                         # DELETE

backend/
├── main.py                           # MODIFY — add /api/crypto/{symbol}/history endpoint
```

---

### Task 1: Create design tokens and CSS Module infrastructure

**Files:**
- Create: `frontend/src/styles/tokens.css`
- Modify: `frontend/src/main.jsx:3` (remove index.css import)
- Delete: `frontend/src/index.css`
- Delete: `frontend/src/App.css`

- [ ] **Step 1: Create tokens.css**

```css
/* frontend/src/styles/tokens.css */
:root {
  /* Backgrounds */
  --bg-primary: #f8f5f0;
  --bg-card: #ffffff;
  --bg-secondary: #f0ebe3;

  /* Text */
  --text-primary: #3d3429;
  --text-secondary: #8a7a6a;
  --text-tertiary: #b0a090;

  /* Accent */
  --accent: #3d3429;
  --accent-hover: #2d2419;
  --green: #5a8a5e;
  --red: #c07060;

  /* Borders */
  --border-light: #e8e0d4;
  --border-medium: #d4c8b8;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-pill: 24px;

  /* Typography */
  --font-family: -apple-system, 'Noto Sans SC', 'Hiragino Sans', sans-serif;
  --font-light: 300;
  --font-normal: 500;
  --font-semibold: 600;
}
```

- [ ] **Step 2: Update main.jsx to remove index.css**

Replace `frontend/src/main.jsx` with:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Delete old CSS files**

```bash
rm frontend/src/index.css frontend/src/App.css
```

- [ ] **Step 4: Verify dev server starts**

```bash
cd frontend && npm run dev
```

Expected: Server starts on port 5173. Page will look unstyled (no CSS) — that's expected.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/tokens.css frontend/src/main.jsx
git rm frontend/src/index.css frontend/src/App.css
git commit -m "feat: add design tokens, remove old CSS files"
```

---

### Task 2: Redesign App component (header, nav, footer, layout)

**Files:**
- Create: `frontend/src/components/App.module.css`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create App.module.css**

```css
/* frontend/src/components/App.module.css */
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-xl);
  font-family: var(--font-family);
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xl) 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-3xl);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
}

.logoIcon {
  font-size: 24px;
}

.logoText {
  font-size: 18px;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  letter-spacing: 1px;
}

/* Navigation */
.nav {
  display: flex;
  gap: var(--space-xl);
}

.navItem {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 14px;
  font-weight: var(--font-normal);
  cursor: pointer;
  padding: var(--space-sm) 0;
  position: relative;
  transition: color 0.2s;
  font-family: var(--font-family);
}

.navItem:hover:not(:disabled) {
  color: var(--text-primary);
}

.navItemActive {
  color: var(--text-primary);
}

.navItemActive::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
}

.navItem:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* Main */
.main {
  min-height: 60vh;
}

/* Footer */
.footer {
  margin-top: var(--space-3xl);
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--border-light);
  text-align: center;
}

.footer p {
  color: var(--text-tertiary);
  font-size: 13px;
}
```

- [ ] **Step 2: Update App.jsx**

Replace `frontend/src/App.jsx` with:

```jsx
import { useState } from 'react'
import PortfolioInput from './components/PortfolioInput'
import Dashboard from './components/Dashboard'
import Report from './components/Report'
import Education from './components/Education'
import HoldingDetail from './components/HoldingDetail'
import styles from './components/App.module.css'

function App() {
  const [page, setPage] = useState('input')
  const [portfolio, setPortfolio] = useState({ funds: [], cryptos: [] })
  const [analysis, setAnalysis] = useState(null)
  const [report, setReport] = useState(null)
  const [selectedHolding, setSelectedHolding] = useState(null)

  const navItems = [
    { key: 'input', label: '录入持仓' },
    { key: 'dashboard', label: '数据看板' },
    { key: 'report', label: 'AI 体检' },
    { key: 'education', label: '学一学' },
  ]

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => setPage('input')}>
          <span className={styles.logoIcon}>🌱</span>
          <span className={styles.logoText}>我的钱还好吗？</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`${styles.navItem} ${page === item.key ? styles.navItemActive : ''}`}
              disabled={item.key !== 'input' && item.key !== 'education' && portfolio.funds.length + portfolio.cryptos.length === 0}
              onClick={() => {
                if (item.key === 'dashboard') {
                  if (!analysis && portfolio.funds.length + portfolio.cryptos.length > 0) {
                    setAnalysis({ loading: true })
                    setPage('dashboard')
                    import('./api').then(({ analyzePortfolio }) => analyzePortfolio(portfolio)).then(setAnalysis).catch(e => setAnalysis({ error: e.message }))
                  } else {
                    setPage('dashboard')
                  }
                } else if (item.key === 'report') {
                  if (!report && portfolio.funds.length + portfolio.cryptos.length > 0) {
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
            onSelectHolding={(holding) => {
              setSelectedHolding(holding)
              setPage('detail')
            }}
          />
        )}
        {page === 'report' && <Report report={report} />}
        {page === 'education' && <Education />}
        {page === 'detail' && selectedHolding && (
          <HoldingDetail
            holding={selectedHolding}
            onBack={() => setPage('dashboard')}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>💡 投资有风险，入市需谨慎。本工具仅供学习参考，不构成投资建议。</p>
      </footer>
    </div>
  )
}

export default App
```

- [ ] **Step 3: Verify dev server renders new header**

```bash
cd frontend && npm run dev
```

Expected: Page shows warm beige background, "🌱 我的钱还好吗？" header with underline nav indicators.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/App.module.css frontend/src/App.jsx
git commit -m "feat: redesign App shell with MUJI warm theme"
```

---

### Task 3: Redesign PortfolioInput component

**Files:**
- Create: `frontend/src/components/PortfolioInput.module.css`
- Modify: `frontend/src/components/PortfolioInput.jsx`

- [ ] **Step 1: Create PortfolioInput.module.css**

```css
/* frontend/src/components/PortfolioInput.module.css */
.section {
  margin-bottom: var(--space-3xl);
}

.sectionTitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  letter-spacing: 1px;
}

.sectionTitle::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-light);
}

.description {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: var(--space-2xl);
  line-height: 1.6;
}

/* Input group — bottom-line style */
.inputGroup {
  display: flex;
  gap: var(--space-md);
  align-items: flex-end;
  margin-bottom: var(--space-md);
}

.inputField {
  flex: 1;
  border: none;
  border-bottom: 1.5px solid var(--border-light);
  background: transparent;
  color: var(--text-primary);
  padding: var(--space-md) 0;
  font-size: 15px;
  font-family: var(--font-family);
  outline: none;
  transition: border-color 0.2s;
}

.inputField:focus {
  border-bottom-color: var(--accent);
}

.inputField::placeholder {
  color: var(--text-tertiary);
}

.inputFieldNarrow {
  max-width: 140px;
}

/* Quick add tags */
.quickAdd {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-top: var(--space-md);
}

.quickTag {
  background: var(--bg-secondary);
  border: none;
  color: var(--text-secondary);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all 0.2s;
}

.quickTag:hover {
  background: var(--accent);
  color: var(--bg-primary);
}

/* Holdings list */
.holdingList {
  margin-top: var(--space-lg);
}

.holdingItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-light);
}

.holdingItem:last-child {
  border-bottom: none;
}

.holdingInfo {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.holdingName {
  font-weight: var(--font-normal);
  font-size: 15px;
}

.holdingDetail {
  color: var(--text-tertiary);
  font-size: 13px;
}

.holdingValue {
  font-weight: var(--font-normal);
  font-size: 15px;
}

/* Buttons */
.btn {
  padding: var(--space-md) var(--space-2xl);
  border-radius: var(--radius-pill);
  border: none;
  font-size: 14px;
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-family);
  letter-spacing: 0.5px;
}

.btnPrimary {
  background: var(--accent);
  color: var(--bg-primary);
}

.btnPrimary:hover {
  background: var(--accent-hover);
}

.btnSecondary {
  background: transparent;
  color: var(--text-primary);
  border: 1.5px solid var(--border-medium);
}

.btnSecondary:hover {
  background: var(--bg-secondary);
}

.btnSmall {
  padding: var(--space-xs) var(--space-md);
  font-size: 12px;
  border-radius: var(--radius-sm);
}

.btnDanger {
  background: transparent;
  color: var(--red);
  border: 1px solid var(--red);
}

.btnDanger:hover {
  background: rgba(192, 112, 96, 0.1);
}

/* Actions */
.actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-3xl);
  justify-content: center;
}
```

- [ ] **Step 2: Update PortfolioInput.jsx**

Replace `frontend/src/components/PortfolioInput.jsx` with:

```jsx
import { useState } from 'react'
import styles from './PortfolioInput.module.css'

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

export default function PortfolioInput({ portfolio, setPortfolio, onAnalyze, onReport }) {
  const [fundCode, setFundCode] = useState('')
  const [fundAmount, setFundAmount] = useState('')
  const [cryptoSymbol, setCryptoSymbol] = useState('')
  const [cryptoAmount, setCryptoAmount] = useState('')

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

  const hasData = portfolio.funds.length > 0 || portfolio.cryptos.length > 0

  return (
    <div>
      {/* Fund section */}
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
                  <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeFund(i)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crypto section */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>加密货币</div>

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
                  <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeCrypto(i)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
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
```

- [ ] **Step 3: Verify page renders with MUJI styling**

```bash
cd frontend && npm run dev
```

Expected: Input page with bottom-line inputs, pill buttons, tag-style quick adds on warm beige background.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/PortfolioInput.jsx frontend/src/components/PortfolioInput.module.css
git commit -m "feat: redesign PortfolioInput with MUJI theme"
```

---

### Task 4: Redesign Dashboard component

**Files:**
- Create: `frontend/src/components/Dashboard.module.css`
- Modify: `frontend/src/components/Dashboard.jsx`

- [ ] **Step 1: Create Dashboard.module.css**

```css
/* frontend/src/components/Dashboard.module.css */
.empty {
  text-align: center;
  padding: 80px 20px;
}

.emptyIcon {
  font-size: 48px;
  margin-bottom: var(--space-lg);
}

.emptyTitle {
  font-size: 18px;
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-sm);
}

.emptyDesc {
  color: var(--text-tertiary);
  font-size: 14px;
}

/* Total balance */
.totalSection {
  text-align: center;
  padding: var(--space-2xl) 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-2xl);
}

.totalLabel {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 3px;
  margin-bottom: var(--space-sm);
}

.totalValue {
  font-size: 32px;
  font-weight: var(--font-light);
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.breakdown {
  display: flex;
  justify-content: center;
  gap: var(--space-2xl);
  margin-top: var(--space-lg);
}

.breakdownItem {
  text-align: center;
}

.breakdownLabel {
  font-size: 11px;
  color: var(--text-tertiary);
}

.breakdownValue {
  font-size: 15px;
  font-weight: var(--font-normal);
  color: var(--text-primary);
  margin-top: 2px;
}

.divider {
  width: 1px;
  background: var(--border-light);
}

/* Holdings list */
.sectionLabel {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 3px;
  margin-bottom: var(--space-lg);
}

.holdingItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background 0.15s;
}

.holdingItem:hover {
  background: var(--bg-secondary);
  margin: 0 calc(-1 * var(--space-md));
  padding-left: var(--space-md);
  padding-right: var(--space-md);
  border-radius: var(--radius-sm);
}

.holdingItem:last-child {
  border-bottom: none;
}

.holdingLeft {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.holdingIcon {
  width: 36px;
  height: 36px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.holdingName {
  font-weight: var(--font-normal);
  font-size: 14px;
}

.holdingSub {
  color: var(--text-tertiary);
  font-size: 11px;
  margin-top: 2px;
}

.holdingRight {
  text-align: right;
}

.holdingValue {
  font-weight: var(--font-normal);
  font-size: 14px;
}

.holdingChange {
  font-size: 11px;
  margin-top: 2px;
}

.positive { color: var(--green); }
.negative { color: var(--red); }

/* Loading */
.loading {
  text-align: center;
  padding: var(--space-3xl);
  color: var(--text-tertiary);
}

.loading::after {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-light);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-left: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.section {
  margin-bottom: var(--space-3xl);
}
```

- [ ] **Step 2: Update Dashboard.jsx**

Replace `frontend/src/components/Dashboard.jsx` with:

```jsx
import styles from './Dashboard.module.css'

export default function Dashboard({ analysis, onSelectHolding }) {
  if (!analysis) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>📊</div>
      <div className={styles.emptyTitle}>还没有数据</div>
      <div className={styles.emptyDesc}>先去「录入持仓」添加你的基金和加密货币吧</div>
    </div>
  )
  if (analysis.loading) return <div className={styles.loading}>正在获取最新数据</div>
  if (analysis.error) return <div className={styles.loading}>出错了：{analysis.error}</div>

  const { funds, cryptos, summary } = analysis

  return (
    <div>
      {/* Total balance */}
      <div className={styles.totalSection}>
        <div className={styles.totalLabel}>总 资 产</div>
        <div className={styles.totalValue}>¥ {(summary.total_fund_value_cny || 0).toLocaleString()}</div>
        <div className={styles.breakdown}>
          <div className={styles.breakdownItem}>
            <div className={styles.breakdownLabel}>基金</div>
            <div className={styles.breakdownValue}>¥{(summary.total_fund_value_cny || 0).toLocaleString()}</div>
          </div>
          <div className={styles.divider} />
          <div className={styles.breakdownItem}>
            <div className={styles.breakdownLabel}>加密</div>
            <div className={styles.breakdownValue}>${(summary.total_crypto_value_usd || 0).toLocaleString()}</div>
          </div>
          <div className={styles.divider} />
          <div className={styles.breakdownItem}>
            <div className={styles.breakdownLabel}>基金数</div>
            <div className={styles.breakdownValue}>{summary.fund_count}</div>
          </div>
          <div className={styles.divider} />
          <div className={styles.breakdownItem}>
            <div className={styles.breakdownLabel}>币种数</div>
            <div className={styles.breakdownValue}>{summary.crypto_count}</div>
          </div>
        </div>
      </div>

      {/* Funds */}
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
                  <div className={styles.holdingIcon}>📊</div>
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

      {/* Cryptos */}
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
                  <div className={styles.holdingIcon}>🪙</div>
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
    </div>
  )
}
```

- [ ] **Step 3: Verify Dashboard renders with MUJI styling and clickable items**

```bash
cd frontend && npm run dev
```

Expected: Dashboard shows thin-font totals, circular icons, divider lines. Holdings are clickable (will navigate to detail page once HoldingDetail exists).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Dashboard.jsx frontend/src/components/Dashboard.module.css
git commit -m "feat: redesign Dashboard with MUJI theme and clickable holdings"
```

---

### Task 5: Redesign Report component

**Files:**
- Create: `frontend/src/components/Report.module.css`
- Modify: `frontend/src/components/Report.jsx`

- [ ] **Step 1: Create Report.module.css**

```css
/* frontend/src/components/Report.module.css */
.empty {
  text-align: center;
  padding: 80px 20px;
}

.emptyIcon {
  font-size: 48px;
  margin-bottom: var(--space-lg);
}

.emptyTitle {
  font-size: 18px;
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-sm);
}

.emptyDesc {
  color: var(--text-tertiary);
  font-size: 14px;
}

.section {
  margin-bottom: var(--space-3xl);
}

.sectionLabel {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 3px;
  margin-bottom: var(--space-lg);
}

/* Report area — dashed border notebook style */
.reportArea {
  border: 1.5px dashed var(--border-medium);
  border-radius: var(--radius-md);
  padding: var(--space-2xl);
  line-height: 1.8;
  font-size: 15px;
  white-space: pre-wrap;
  color: var(--text-primary);
}

/* Inline term highlight */
.term {
  border-bottom: 1px dashed var(--border-medium);
  cursor: pointer;
  transition: border-color 0.2s;
}

.term:hover {
  border-bottom-color: var(--accent);
}

/* Summary stats */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.statCard {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  text-align: center;
}

.statValue {
  font-size: 20px;
  font-weight: var(--font-light);
  margin-bottom: var(--space-xs);
}

.statLabel {
  color: var(--text-tertiary);
  font-size: 12px;
  letter-spacing: 1px;
}

/* Loading */
.loading {
  text-align: center;
  padding: var(--space-3xl);
  color: var(--text-tertiary);
}

.loading::after {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-light);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-left: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 2: Update Report.jsx**

Replace `frontend/src/components/Report.jsx` with:

```jsx
import { useState, useCallback } from 'react'
import { explainConcept } from '../api'
import { highlightTerms } from '../utils/highlightTerms'
import TermExplainer from './TermExplainer'
import styles from './Report.module.css'

export default function Report({ report }) {
  const [termExplanations, setTermExplanations] = useState({})
  const [activeTerm, setActiveTerm] = useState(null)
  const [loadingTerm, setLoadingTerm] = useState(null)

  const handleTermClick = useCallback(async (term) => {
    if (activeTerm === term) {
      setActiveTerm(null)
      return
    }

    setActiveTerm(term)

    if (termExplanations[term]) return

    setLoadingTerm(term)
    try {
      const data = await explainConcept(term)
      setTermExplanations(prev => ({ ...prev, [term]: data.explanation }))
    } catch {
      setTermExplanations(prev => ({ ...prev, [term]: '暂时无法解释，稍后再试试～' }))
    }
    setLoadingTerm(null)
  }, [activeTerm, termExplanations])

  if (!report) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>📝</div>
      <div className={styles.emptyTitle}>还没有 AI 报告</div>
      <div className={styles.emptyDesc}>先去「录入持仓」添加资产，然后点击「AI 体检」</div>
    </div>
  )
  if (report.loading) return <div className={styles.loading}>AI 正在分析你的投资组合</div>
  if (report.error) return <div className={styles.loading}>出错了：{report.error}</div>

  const reportText = report.report || '报告生成中...'

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>AI 投 资 体 检 报 告</div>
        <div className={styles.reportArea}>
          {highlightTerms(reportText, handleTermClick, styles.term)}
        </div>
        {activeTerm && (
          <TermExplainer
            term={activeTerm}
            explanation={termExplanations[activeTerm]}
            loading={loadingTerm === activeTerm}
            onClose={() => setActiveTerm(null)}
          />
        )}
      </div>

      {report.data && report.data.summary && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>数 据 摘 要</div>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>¥{(report.data.summary.total_fund_value_cny || 0).toLocaleString()}</div>
              <div className={styles.statLabel}>基金总值</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>${(report.data.summary.total_crypto_value_usd || 0).toLocaleString()}</div>
              <div className={styles.statLabel}>加密货币总值</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify Report renders with dashed border style**

Note: `highlightTerms` and `TermExplainer` don't exist yet — the page will error. That's expected; we'll create them in Task 8. For now, you can temporarily replace the `highlightTerms` call with just `{reportText}` to verify styling, then revert.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Report.jsx frontend/src/components/Report.module.css
git commit -m "feat: redesign Report with MUJI theme and term highlight hooks"
```

---

### Task 6: Redesign Education component

**Files:**
- Create: `frontend/src/components/Education.module.css`
- Modify: `frontend/src/components/Education.jsx`

- [ ] **Step 1: Create Education.module.css**

```css
/* frontend/src/components/Education.module.css */
.section {
  margin-bottom: var(--space-3xl);
}

.sectionLabel {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 3px;
  margin-bottom: var(--space-lg);
}

.description {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: var(--space-2xl);
  line-height: 1.6;
}

/* Concept cards */
.grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.item {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.item:hover {
  background: var(--border-light);
}

.question {
  font-weight: var(--font-semibold);
  font-size: 14px;
}

.answer {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.7;
  margin-top: var(--space-md);
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.3s, max-height 0.3s, margin-top 0.3s;
}

.answerVisible {
  opacity: 1;
  max-height: 500px;
  margin-top: var(--space-md);
}

.answerLoading {
  color: var(--text-tertiary);
  font-style: italic;
  opacity: 1;
  max-height: 50px;
  margin-top: var(--space-md);
}

/* Roadmap */
.roadmap {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.step {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-light);
}

.step:last-child {
  border-bottom: none;
}

.stepIcon {
  width: 28px;
  height: 28px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.stepDone {
  background: var(--green);
  color: white;
}

.stepTitle {
  font-weight: var(--font-normal);
  font-size: 14px;
}

.stepDesc {
  color: var(--text-tertiary);
  font-size: 12px;
  margin-top: 2px;
}
```

- [ ] **Step 2: Update Education.jsx**

Replace `frontend/src/components/Education.jsx` with:

```jsx
import { useState } from 'react'
import { explainConcept } from '../api'
import styles from './Education.module.css'

const QUESTIONS = [
  { q: '什么是基金？', concept: '基金是什么，用最简单的话解释给完全不懂的人' },
  { q: '余额宝到底是什么？', concept: '余额宝是什么，和银行存款有什么区别' },
  { q: '什么是净值？', concept: '基金的净值是什么意思，怎么理解净值的涨跌' },
  { q: '什么是定投？', concept: '基金定投是什么，为什么适合新手' },
  { q: '什么是波动率？', concept: '投资中的波动率是什么，怎么看' },
  { q: '比特币是什么？', concept: '比特币是什么，为什么这么多人关注' },
  { q: '什么是区块链？', concept: '区块链是什么，用生活中的例子解释' },
  { q: '风险承受能力是什么？', concept: '投资中的风险承受能力是什么，怎么评估' },
  { q: '什么是分散投资？', concept: '不要把鸡蛋放在一个篮子里是什么意思' },
  { q: '什么是 ESG 投资？', concept: 'ESG 投资是什么，为什么越来越多人关注' },
]

export default function Education() {
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState({})
  const [visible, setVisible] = useState({})

  const handleExplain = async (index, concept) => {
    if (answers[index]) {
      setVisible(prev => ({ ...prev, [index]: !prev[index] }))
      return
    }

    setLoading(prev => ({ ...prev, [index]: true }))
    try {
      const data = await explainConcept(concept)
      setAnswers(prev => ({ ...prev, [index]: data.explanation }))
      setVisible(prev => ({ ...prev, [index]: true }))
    } catch {
      setAnswers(prev => ({ ...prev, [index]: '暂时无法解释，稍后再试试～' }))
      setVisible(prev => ({ ...prev, [index]: true }))
    }
    setLoading(prev => ({ ...prev, [index]: false }))
  }

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>投 资 小 课 堂</div>
        <p className={styles.description}>不懂的概念点一下，AI 帮你用大白话解释</p>

        <div className={styles.grid}>
          {QUESTIONS.map((item, i) => (
            <div
              className={styles.item}
              key={i}
              onClick={() => handleExplain(i, item.concept)}
            >
              <div className={styles.question}>
                {visible[i] ? '💡' : '❓'} {item.q}
              </div>
              {loading[i] && (
                <div className={`${styles.answer} ${styles.answerLoading}`}>思考中...</div>
              )}
              {answers[i] && !loading[i] && (
                <div className={`${styles.answer} ${visible[i] ? styles.answerVisible : ''}`}>
                  {answers[i]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>新 手 入 门 路 径</div>
        <div className={styles.roadmap}>
          {[
            { step: 1, title: '认识你的钱', desc: '先搞清楚你把钱放在了哪里', done: true },
            { step: 2, title: '看懂体检报告', desc: '了解你的投资组合状况', done: false },
            { step: 3, title: '学习基础概念', desc: '点一点上面的问题，涨知识', done: false },
            { step: 4, title: '开始行动', desc: '设定目标，制定计划', done: false },
          ].map(item => (
            <div className={styles.step} key={item.step}>
              <div className={`${styles.stepIcon} ${item.done ? styles.stepDone : ''}`}>
                {item.done ? '✓' : item.step}
              </div>
              <div>
                <div className={styles.stepTitle}>{item.title}</div>
                <div className={styles.stepDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify Education renders with fade-in animations**

```bash
cd frontend && npm run dev
```

Expected: Concept cards on warm background, click to expand with fade animation, roadmap with numbered circles.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Education.jsx frontend/src/components/Education.module.css
git commit -m "feat: redesign Education with MUJI theme and fade animations"
```

---

### Task 7: Add crypto history API endpoint

**Files:**
- Modify: `backend/main.py:74-77` (add new route after existing crypto routes)

- [ ] **Step 1: Add crypto history endpoint to main.py**

Insert after line 77 (`return get_crypto_detail(symbol)`) in `backend/main.py`:

```python
@app.get("/api/crypto/{symbol}/history")
def api_crypto_history(symbol: str, days: int = 30):
    """获取币种历史价格"""
    from services.crypto_service import get_crypto_history
    return get_crypto_history(symbol, days)
```

- [ ] **Step 2: Add getCryptoHistory to api.js**

Add to `frontend/src/api.js`:

```javascript
export async function getCryptoHistory(symbol, days = 30) {
  const res = await fetch(`${API_BASE}/api/crypto/${symbol}/history?days=${days}`);
  return res.json();
}
```

- [ ] **Step 3: Restart backend and test endpoint**

```bash
cd backend && source venv/bin/activate && python main.py &
curl http://localhost:8000/api/crypto/BTC/history?days=7
```

Expected: JSON response with `symbol` and `prices` array containing timestamp/price pairs.

- [ ] **Step 4: Commit**

```bash
git add backend/main.py frontend/src/api.js
git commit -m "feat: add crypto history API endpoint"
```

---

### Task 8: Create HoldingDetail component with SVG chart

**Files:**
- Create: `frontend/src/components/HoldingDetail.jsx`
- Create: `frontend/src/components/HoldingDetail.module.css`

- [ ] **Step 1: Create HoldingDetail.module.css**

```css
/* frontend/src/components/HoldingDetail.module.css */
.container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Back button */
.back {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-family: var(--font-family);
  cursor: pointer;
  padding: var(--space-sm) 0;
  margin-bottom: var(--space-xl);
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  transition: color 0.2s;
}

.back:hover {
  color: var(--text-primary);
}

/* Header */
.header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.name {
  font-size: 16px;
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-xs);
}

.code {
  font-size: 12px;
  color: var(--text-tertiary);
}

.value {
  font-size: 28px;
  font-weight: var(--font-light);
  margin-top: var(--space-md);
  letter-spacing: -0.5px;
}

.change {
  font-size: 13px;
  margin-top: var(--space-xs);
}

/* Chart */
.chartContainer {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-2xl);
}

.chartTitle {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 2px;
  margin-bottom: var(--space-lg);
}

.chartSvg {
  width: 100%;
  height: 160px;
}

.chartLine {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chartArea {
  fill: var(--bg-primary);
  opacity: 0.6;
}

.chartDot {
  fill: var(--accent);
}

.chartGrid {
  stroke: var(--border-light);
  stroke-width: 0.5;
  stroke-dasharray: 4 4;
}

.chartLabel {
  font-size: 10px;
  fill: var(--text-tertiary);
}

/* Stats grid */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.statCard {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  text-align: center;
}

.statLabel {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 1px;
  margin-bottom: var(--space-sm);
}

.statValue {
  font-size: 20px;
  font-weight: var(--font-light);
}

/* Loading */
.loading {
  text-align: center;
  padding: var(--space-3xl);
  color: var(--text-tertiary);
}

.loading::after {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-light);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-left: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.positive { color: var(--green); }
.negative { color: var(--red); }
```

- [ ] **Step 2: Create HoldingDetail.jsx**

```jsx
import { useState, useEffect, useMemo } from 'react'
import { getFundInfo, getCryptoHistory, getCryptoDetail } from '../api'
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
    if (holding.type === 'crypto' && detail.prices) {
      return detail.prices.map(p => ({
        label: new Date(p.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        value: p.price,
      }))
    }
    return null
  }, [detail, holding.type])

  if (loading) return <div className={styles.loading}>加载中...</div>
  if (!detail || detail.error) return <div className={styles.loading}>出错了：{detail?.error || '未知错误'}</div>

  const isFund = holding.type === 'fund'
  const currentValue = isFund
    ? `¥ ${(detail.latest_nav * (holding.amount / detail.latest_nav)).toLocaleString()}`
    : `$ ${(detail.price_usd * holding.amount).toLocaleString()}`
  const returnPct = isFund ? detail.period_return_30d : detail.price_change_30d

  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={onBack}>← 返回看板</button>

      <div className={styles.header}>
        <div className={styles.name}>{isFund ? (detail.name || detail.code) : detail.name}</div>
        <div className={styles.code}>{isFund ? detail.code : detail.symbol}</div>
        <div className={styles.value}>{isFund ? `¥ ${detail.latest_nav}` : `$ ${detail.price_usd?.toLocaleString()}`}</div>
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
        {isFund && (
          <>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>波动率</div>
              <div className={styles.statValue}>{detail.volatility_30d}%</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>最新净值</div>
              <div className={styles.statValue}>{detail.latest_nav}</div>
            </div>
          </>
        )}
        {!isFund && (
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
```

- [ ] **Step 3: Verify HoldingDetail renders with real data**

```bash
cd frontend && npm run dev
```

Add a fund (e.g., 110011), click "查看数据", then click on the fund in the dashboard. Expected: Detail page with name, NAV, SVG line chart, and stats grid.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/HoldingDetail.jsx frontend/src/components/HoldingDetail.module.css
git commit -m "feat: add HoldingDetail page with SVG chart and real API data"
```

---

### Task 9: Create inline education utilities (highlightTerms + TermExplainer)

**Files:**
- Create: `frontend/src/utils/highlightTerms.js`
- Create: `frontend/src/components/TermExplainer.jsx`
- Create: `frontend/src/components/TermExplainer.module.css`

- [ ] **Step 1: Create highlightTerms.js**

```javascript
// frontend/src/utils/highlightTerms.js
import { createElement, Fragment } from 'react'

const TERMS = [
  '波动率', '夏普比率', '分散投资', '净值', '回撤', '收益率',
  '年化', '仓位', '止损', '定投', '复利', '市盈率', '资产配置',
]

export function highlightTerms(text, onTermClick, termClassName) {
  if (!text) return text

  const pattern = new RegExp(`(${TERMS.join('|')})`, 'g')
  const parts = text.split(pattern)

  return parts.map((part, i) => {
    if (TERMS.includes(part)) {
      return createElement(
        'span',
        {
          key: i,
          className: termClassName,
          onClick: (e) => {
            e.preventDefault()
            onTermClick(part)
          },
        },
        part
      )
    }
    return createElement(Fragment, { key: i }, part)
  })
}
```

- [ ] **Step 2: Create TermExplainer.module.css**

```css
/* frontend/src/components/TermExplainer.module.css */
.container {
  margin-top: var(--space-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.3s, max-height 0.3s;
}

.containerVisible {
  opacity: 1;
  max-height: 500px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.term {
  font-weight: var(--font-semibold);
  font-size: 14px;
  color: var(--text-primary);
}

.close {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
  font-family: var(--font-family);
}

.close:hover {
  color: var(--text-primary);
}

.content {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.loadingText {
  color: var(--text-tertiary);
  font-style: italic;
}
```

- [ ] **Step 3: Create TermExplainer.jsx**

```jsx
import { useEffect, useState } from 'react'
import styles from './TermExplainer.module.css'

export default function TermExplainer({ term, explanation, loading, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div className={`${styles.container} ${visible ? styles.containerVisible : ''}`}>
      <div className={styles.header}>
        <span className={styles.term}>💡 {term}</span>
        <button className={styles.close} onClick={onClose}>×</button>
      </div>
      <div className={styles.content}>
        {loading ? (
          <span className={styles.loadingText}>AI 正在解释...</span>
        ) : (
          explanation || '暂无解释'
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify inline education works end-to-end**

```bash
cd frontend && npm run dev
```

Add holdings, generate AI report. Expected: Report text has dashed-underlined terms. Click a term → expandable card appears with LLM explanation. Click again → collapse. Click × → close.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/utils/highlightTerms.js frontend/src/components/TermExplainer.jsx frontend/src/components/TermExplainer.module.css
git commit -m "feat: add inline term highlighting and explainer in AI reports"
```

---

### Task 10: Lint and final verification

**Files:** None (verification only)

- [ ] **Step 1: Run ESLint**

```bash
cd frontend && npm run lint
```

Expected: No errors. Fix any warnings.

- [ ] **Step 2: Run production build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Manual smoke test**

Start both servers and verify:
1. Input page: warm beige, bottom-line inputs, pill buttons
2. Add fund 110011 + crypto BTC, click "查看数据"
3. Dashboard: thin-font totals, circular icons, click a holding
4. HoldingDetail: SVG chart loads with real 30-day data, stats grid
5. Go back, click "AI 体检"
6. Report: dashed border area, click a highlighted term, explanation appears
7. Education: concept cards with fade-in animation

```bash
cd backend && source venv/bin/activate && python main.py &
cd frontend && npm run dev
```

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: lint fixes and final polish"
```
