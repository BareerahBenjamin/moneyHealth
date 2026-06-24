import { useState, useRef, useCallback, useMemo, Component } from 'react'
import ReactMarkdown from 'react-markdown'
import { explainConcept } from '../api'
import { highlightTerms } from '../utils/highlightTerms'
import TermExplainer from './TermExplainer'
import styles from './Report.module.css'

// 错误边界：防止 ReactMarkdown 崩溃导致白屏
class MarkdownBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return <div className={styles.loading}>报告渲染出错，请刷新重试</div>
    }
    return this.props.children
  }
}

export default function Report({ report, onRefresh }) {
  // ── 所有 hooks 必须在 early return 之前 ──
  const [termExplanations, setTermExplanations] = useState({})
  const [activeTerm, setActiveTerm] = useState(null)
  const [loadingTerm, setLoadingTerm] = useState(null)

  const stateRef = useRef({ activeTerm, termExplanations })
  stateRef.current = { activeTerm, termExplanations }

  const handleTermClick = useCallback(async (term) => {
    const { activeTerm: current, termExplanations: explanations } = stateRef.current
    if (current === term) {
      setActiveTerm(null)
      return
    }
    setActiveTerm(term)
    if (explanations[term]) return
    setLoadingTerm(term)
    try {
      const data = await explainConcept(term)
      setTermExplanations(prev => ({ ...prev, [term]: data.explanation }))
    } catch {
      setTermExplanations(prev => ({ ...prev, [term]: '暂时无法解释，稍后再试试～' }))
    }
    setLoadingTerm(null)
  }, [])

  const markdownComponents = useMemo(() => ({
    p(props) {
      const { children, node, ...rest } = props
      return <p {...rest}>{typeof children === 'string' ? highlightTerms(children, handleTermClick, styles.term) : children}</p>
    },
    li(props) {
      const { children, node, ...rest } = props
      return <li {...rest}>{typeof children === 'string' ? highlightTerms(children, handleTermClick, styles.term) : children}</li>
    },
    td(props) {
      const { children, node, ...rest } = props
      return <td {...rest}>{typeof children === 'string' ? highlightTerms(children, handleTermClick, styles.term) : children}</td>
    },
    th(props) {
      const { children, node, ...rest } = props
      return <th {...rest}>{typeof children === 'string' ? highlightTerms(children, handleTermClick, styles.term) : children}</th>
    },
  }), [handleTermClick])

  // ── early return 在 hooks 之后 ──
  if (!report) return (
    <div className={styles.empty}>
      <div className={styles.emptyTitle}>还没有 AI 报告</div>
      <div className={styles.emptyDesc}>先去「录入持仓」添加资产，然后点击「AI 体检」</div>
    </div>
  )
  if (report.loading) return <div className={styles.loading}>AI 正在分析你的投资组合</div>
  if (report.error) return (
    <div className={styles.empty}>
      <div className={styles.emptyTitle}>出错了</div>
      <div className={styles.emptyDesc}>{report.error}</div>
      {onRefresh && <button className={styles.refreshBtn} onClick={onRefresh} style={{marginTop: 16}}>重试</button>}
    </div>
  )

  const reportText = report.report
  if (!reportText) return (
    <div className={styles.empty}>
      <div className={styles.emptyTitle}>报告内容为空</div>
      <div className={styles.emptyDesc}>AI 未能生成报告，请重试</div>
      {onRefresh && <button className={styles.refreshBtn} onClick={onRefresh} style={{marginTop: 16}}>重试</button>}
    </div>
  )

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          AI 投 资 体 检 报 告
          {onRefresh && <button className={styles.refreshBtn} onClick={onRefresh} title="重新生成报告">↻</button>}
        </div>
        <div className={styles.reportArea}>
          <MarkdownBoundary>
            <ReactMarkdown components={markdownComponents}>{reportText}</ReactMarkdown>
          </MarkdownBoundary>
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
              <div className={styles.statValue}>¥{(report.data.summary.total_stock_value_cny || 0).toLocaleString()}</div>
              <div className={styles.statLabel}>股票总值</div>
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
