import { useState } from 'react'
import { analyzeSupplyChain } from '../api'
import styles from './SupplyChain.module.css'

const LABELS = {
  verified: { text: '证实', cls: 'verified' },
  partial: { text: '部分属实', cls: 'partial' },
  false: { text: '错误/误导', cls: 'wrong' },
  unverified: { text: '未溯源', cls: 'unverified' },
}

const STRENGTH = {
  强: 'strong',
  中: 'mid',
  弱: 'weak',
}

const EXAMPLES = ['稀土', '锂', '高纯石英砂', '萤石', '锗']

export default function SupplyChain() {
  const [material, setMaterial] = useState('')
  const [context, setContext] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    const m = material.trim()
    if (!m || loading) return
    setLoading(true)
    setResult(null)
    try {
      const data = await analyzeSupplyChain(m, context.trim())
      setResult(data)
    } catch (e) {
      setResult({ ok: false, summary: `请求失败：${e.message}`, layers: [], beneficiaries: [] })
    }
    setLoading(false)
  }

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>产 业 链 分 析</div>
        <p className={styles.description}>
          输入一个原材料/金属/矿产，AI 用<strong>五层漏斗</strong>帮你看清产业链格局：
          供需 → 资源掌控 → 国产替代 → AI 关联 → 政策地缘 → 受益标的，
          并对挑出的 A 股标的<strong>现取实时价</strong>。
          <br />只给证据和格局，买不买永远是你自己定。
        </p>

        <input
          className={styles.matInput}
          placeholder="原材料名称，如 稀土 / 锂 / 高纯石英砂"
          value={material}
          onChange={e => setMaterial(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
        />

        <textarea
          className={styles.ctxInput}
          placeholder="（可选）想验证的逻辑或背景，比如：听说出口管制要让某材料暴涨，相关股票要起飞"
          value={context}
          onChange={e => setContext(e.target.value)}
          rows={3}
        />

        <div className={styles.examples}>
          <span className={styles.examplesLabel}>试试：</span>
          {EXAMPLES.map(ex => (
            <button key={ex} className={styles.exampleChip} onClick={() => setMaterial(ex)}>
              {ex}
            </button>
          ))}
        </div>

        <button className={styles.btn} onClick={handleAnalyze} disabled={loading || !material.trim()}>
          {loading ? '正在跑五层漏斗…（约需十几秒）' : '分析产业链'}
        </button>
      </div>

      {result && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>分 析 结 果</div>

          {result.applicable === false && (
            <div className={styles.notApplicable}>
              <strong>这个对象不太适合用产业链漏斗</strong>
              <div>{result.applicable_note}</div>
            </div>
          )}

          {result.summary && (
            <div className={styles.summaryCard}>
              <div className={styles.summaryTitle}>总评</div>
              <div className={styles.summaryText}>{result.summary}</div>
            </div>
          )}

          {result.scorecard && result.scorecard.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Scorecard（五维定量）</div>
              <div className={styles.scoreGrid}>
                {result.scorecard.map((s, i) => (
                  <div key={i} className={styles.scoreRow}>
                    <span className={styles.scoreDim}>{s.dim}</span>
                    <span className={styles.scoreVal}>{s.value}</span>
                    <span className={styles.scoreLevel}>{s.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.layers && result.layers.length > 0 && (
            <div className={styles.layers}>
              {result.layers.map((l, i) => (
                <div key={i} className={styles.layerCard}>
                  <div className={styles.layerTitle}>{l.title}</div>
                  <div className={styles.layerConclusion}>{l.conclusion}</div>
                  {l.self_check && (
                    <div className={styles.selfCheck}>自检：{l.self_check}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.beneficiaries && result.beneficiaries.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>受益标的（A股，含实时价）</div>
              {result.beneficiaries.map((b, i) => (
                <div key={i} className={styles.benRow}>
                  <div className={styles.benHead}>
                    <span className={styles.benSegment}>{b.segment}</span>
                    <span className={styles.benName}>
                      {b.name}{b.code ? `（${b.code}）` : ''}
                    </span>
                    {b.thesis_strength && (
                      <span className={`${styles.strength} ${styles[STRENGTH[b.thesis_strength] || 'weak']}`}>
                        thesis {b.thesis_strength}
                      </span>
                    )}
                  </div>
                  {b.market && !b.market.error && (
                    <div className={styles.benPrice}>
                      {b.market.price}
                      {b.market.daily_change != null && <> · 当日 {b.market.daily_change}%</>}
                      {b.market.return_30d != null && <> · 近30天 {b.market.return_30d}%</>}
                      <span className={styles.benSource}>{b.market.source} · {b.market.as_of}</span>
                    </div>
                  )}
                  {b.market && b.market.error && (
                    <div className={styles.benPriceErr}>实时价查不到（{b.market.error}）</div>
                  )}
                  {b.strength_reason && <div className={styles.benNote}>强度依据：{b.strength_reason}</div>}
                  {b.note && <div className={styles.benNote}>{b.note}</div>}
                </div>
              ))}
            </div>
          )}

          {result.claims && result.claims.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>核验矩阵（关键数字可信度）</div>
              {result.claims.map((c, i) => {
                const meta = LABELS[c.label] || LABELS.unverified
                return (
                  <div key={i} className={`${styles.claimCard} ${styles[meta.cls]}`}>
                    <span className={styles.claimBadge}>{meta.text}</span>
                    <div className={styles.claimText}>{c.claim}</div>
                    {c.reason && <div className={styles.claimReason}>{c.reason}</div>}
                  </div>
                )
              })}
            </div>
          )}

          {result.catalysts && result.catalysts.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>催化剂日历</div>
              {result.catalysts.map((c, i) => (
                <div key={i} className={styles.catRow}>
                  <span className={styles.catWindow}>{c.window}</span>
                  <span className={styles.catEvent}>{c.event}</span>
                </div>
              ))}
            </div>
          )}

          {result.raw && (!result.layers || result.layers.length === 0) && (
            <div className={styles.rawBox}>{result.raw}</div>
          )}

          {result.biggest_risk && (
            <div className={styles.riskCard}>
              <div className={styles.riskTitle}>最大的风险 / 反方观点</div>
              <div className={styles.riskText}>{result.biggest_risk}</div>
            </div>
          )}

          {result.bottom_line && <div className={styles.bottomLine}>{result.bottom_line}</div>}

          <div className={styles.disclaimer}>
            标的实时价由系统现取（标了来源+时间）；产业链里的占比/国产化率等数字 AI 未逐条溯源到一手，
            多标为未溯源，仅供建立格局认知。本工具只给证据和风险，<strong>买不买、买多少，决策权永远在你手里</strong>。
          </div>
        </div>
      )}
    </div>
  )
}
