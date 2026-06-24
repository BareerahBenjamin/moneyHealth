import { useState } from 'react'
import { verifyClaims } from '../api'
import styles from './FactCheck.module.css'

const LABELS = {
  verified: { text: '证实', cls: 'verified' },
  partial: { text: '部分属实', cls: 'partial' },
  false: { text: '错误/误导', cls: 'wrong' },
  unverified: { text: '无法证实', cls: 'unverified' },
}

const EXAMPLES = [
  '某稀土材料一年涨了100倍，相关股票马上要起飞，赶紧上车！',
  '据说这只基金的经理是顶流，过去三年年年翻倍，闭眼买就行。',
  '群里说这个币被某交易所下架了，要归零，大家快跑。',
]

export default function FactCheck() {
  const [content, setContent] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    const text = content.trim()
    if (!text || loading) return
    setLoading(true)
    setResult(null)
    try {
      const data = await verifyClaims(text)
      setResult(data)
    } catch (e) {
      setResult({ ok: false, summary: `请求失败：${e.message}`, claims: [] })
    }
    setLoading(false)
  }

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>谣 言 验 真</div>
        <p className={styles.description}>
          收到转发的"小作文"、研报截图、群里的"重磅消息"？粘进来，AI 把它当成
          <strong>待验证的假设</strong>，逐条拆开核实，告诉你哪些是真、哪些是假、哪些查不到。
          <br />决定买不买，永远是你自己 —— AI 只帮你把功课做扎实。
        </p>

        <textarea
          className={styles.input}
          placeholder="把那段消息 / 研报 / 大V观点粘到这里…"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
        />

        <div className={styles.examples}>
          <span className={styles.examplesLabel}>试试这些：</span>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className={styles.exampleChip} onClick={() => setContent(ex)}>
              {ex.length > 18 ? ex.slice(0, 18) + '…' : ex}
            </button>
          ))}
        </div>

        <button className={styles.verifyBtn} onClick={handleVerify} disabled={loading || !content.trim()}>
          {loading ? '正在逐条核实…' : '帮我验真'}
        </button>
      </div>

      {result && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>核 验 结 果</div>

          {result.summary && (
            <div className={styles.summaryCard}>
              <div className={styles.summaryTitle}>总评</div>
              <div className={styles.summaryText}>{result.summary}</div>
              {result.skeleton_truth && (
                <div className={styles.skeleton}>{result.skeleton_truth}</div>
              )}
            </div>
          )}

          {result.market_evidence && result.market_evidence.length > 0 && (
            <div className={styles.evidence}>
              <div className={styles.evidenceTitle}>实时行情佐证（现取，已标来源+时间）</div>
              {result.market_evidence.map((e, i) => (
                <div key={i} className={`${styles.evidenceRow} ${e.error ? styles.evidenceErr : ''}`}>
                  {e.error ? (
                    <span className={styles.evidenceText}>
                      <strong>{e.query}</strong> · 查不到（{e.error}）
                    </span>
                  ) : (
                    <span className={styles.evidenceText}>
                      <strong>{e.label}</strong> {e.price}
                      {e.daily_change != null && <> · 当日 {e.daily_change}%</>}
                      {e.change_24h != null && <> · 24h {e.change_24h}%</>}
                      {e.return_30d != null && <> · 近30天 {e.return_30d}%</>}
                      {e.change_30d != null && <> · 近30天 {e.change_30d}%</>}
                      {e.ath_change_pct != null && <> · 距高点 {e.ath_change_pct}%</>}
                      <span className={styles.evidenceSource}>{e.source} · {e.as_of}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.claims && result.claims.length > 0 && (
            <div className={styles.matrix}>
              {result.claims.map((c, i) => {
                const meta = LABELS[c.label] || LABELS.unverified
                return (
                  <div key={i} className={`${styles.claimCard} ${styles[meta.cls]}`}>
                    <div className={styles.claimHeader}>
                      <span className={styles.claimBadge}>{meta.text}</span>
                    </div>
                    <div className={styles.claimText}>{c.claim}</div>
                    {c.reason && <div className={styles.claimReason}>{c.reason}</div>}
                  </div>
                )
              })}
            </div>
          )}

          {result.raw && (!result.claims || result.claims.length === 0) && (
            <div className={styles.rawBox}>{result.raw}</div>
          )}

          {result.biggest_risk && (
            <div className={styles.riskCard}>
              <div className={styles.riskTitle}>最大的坑</div>
              <div className={styles.riskText}>{result.biggest_risk}</div>
            </div>
          )}

          {result.bottom_line && (
            <div className={styles.bottomLine}>{result.bottom_line}</div>
          )}

          <div className={styles.disclaimer}>
            涉及 A股/公募基金/加密货币的量级说法，已用实时行情现取核实；美股/港股等暂查不到的会标为存疑，请去「数据看板」自查。
            本工具只给证据和风险，<strong>买不买、买多少，决策权永远在你手里</strong>。
          </div>
        </div>
      )}
    </div>
  )
}
