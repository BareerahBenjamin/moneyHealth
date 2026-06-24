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
