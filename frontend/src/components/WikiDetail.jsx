import { useState, useEffect } from 'react'
import { getWikiEntry, saveWikiEntry, deleteWikiEntry } from '../api'
import styles from './WikiDetail.module.css'

const TYPE_LABELS = {
  companies: '公司档案',
  industries: '行业分析',
  frameworks: '研究框架',
}

const EMPTY_COMPANY = {
  name: '',
  summary: '',
  bull: [],
  bear: [],
  score: { moat: 0, growth: 0, risk: 0, valuation: 0 },
  notes: [],
  changelog: [],
}

const EMPTY_INDUSTRY = {
  name: '',
  summary: '',
  valueChain: '',
  keyPlayers: [],
  trends: [],
  risks: [],
  notes: [],
  changelog: [],
}

const EMPTY_FRAMEWORK = {
  name: '',
  summary: '',
  description: '',
  keyMetrics: [],
  examples: [],
  notes: [],
  changelog: [],
}

function getEmpty(entryType) {
  if (entryType === 'companies') return { ...EMPTY_COMPANY }
  if (entryType === 'industries') return { ...EMPTY_INDUSTRY }
  return { ...EMPTY_FRAMEWORK }
}

export default function WikiDetail({ entryType, entryId, onBack }) {
  const [entry, setEntry] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bullInput, setBullInput] = useState('')
  const [bearInput, setBearInput] = useState('')
  const [noteInput, setNoteInput] = useState('')

  useEffect(() => {
    setLoading(true)
    getWikiEntry(entryType, entryId)
      .then(data => {
        if (data.error) {
          // 新条目
          const empty = getEmpty(entryType)
          empty.id = entryId
          setEntry(null)
          setForm(empty)
          setEditing(true)
        } else {
          setEntry(data)
          setForm(data)
        }
      })
      .catch(() => {
        const empty = getEmpty(entryType)
        empty.id = entryId
        setEntry(null)
        setForm(empty)
        setEditing(true)
      })
      .finally(() => setLoading(false))
  }, [entryType, entryId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await saveWikiEntry(entryType, entryId, form)
      setEntry(result)
      setForm(result)
      setEditing(false)
    } catch (e) {
      alert('保存失败: ' + e.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(`确定删除 ${entryId}？此操作不可撤销。`)) return
    try {
      await deleteWikiEntry(entryType, entryId)
      onBack()
    } catch (e) {
      alert('删除失败: ' + e.message)
    }
  }

  const addListItem = (field, value, setter) => {
    if (!value.trim()) return
    setForm(f => ({ ...f, [field]: [...(f[field] || []), value.trim()] }))
    setter('')
  }

  const removeListItem = (field, index) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))
  }

  const updateScore = (key, value) => {
    setForm(f => ({
      ...f,
      score: { ...f.score, [key]: parseInt(value) || 0 }
    }))
  }

  if (loading) return <div className={styles.page}><div className={styles.loading}>加载中...</div></div>

  return (
    <div className={styles.page}>
      {/* 头部 */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← 返回</button>
        <div className={styles.headerActions}>
          {!editing && entry && (
            <>
              <button className={styles.editBtn} onClick={() => setEditing(true)}>编辑</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>删除</button>
            </>
          )}
        </div>
      </div>

      <div className={styles.sectionLabel}>{TYPE_LABELS[entryType] || entryType}</div>
      <div className={styles.entryId}>{entryId}</div>

      {editing ? (
        /* 编辑模式 */
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>名称</label>
            <input
              className={styles.input}
              value={form.name || ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="如：贵州茅台 / 半导体 / 护城河评分"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>摘要</label>
            <textarea
              className={styles.textarea}
              value={form.summary || ''}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              placeholder="一句话概括核心观点"
              rows={2}
            />
          </div>

          {entryType === 'companies' && (
            <>
              {/* 评分 */}
              <div className={styles.field}>
                <label className={styles.label}>评分（0-5）</label>
                <div className={styles.scoreGrid}>
                  {['moat', 'growth', 'risk', 'valuation'].map(key => (
                    <div key={key} className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>
                        {key === 'moat' ? '护城河' : key === 'growth' ? '成长性' : key === 'risk' ? '风险' : '估值'}
                      </span>
                      <input
                        className={styles.scoreInput}
                        type="number"
                        min="0"
                        max="5"
                        value={form.score?.[key] || 0}
                        onChange={e => updateScore(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 看多 */}
              <div className={styles.field}>
                <label className={styles.label}>看多理由</label>
                <div className={styles.listItems}>
                  {(form.bull || []).map((item, i) => (
                    <div key={i} className={styles.listItem}>
                      <span>{item}</span>
                      <button className={styles.removeBtn} onClick={() => removeListItem('bull', i)}>×</button>
                    </div>
                  ))}
                </div>
                <div className={styles.listAdd}>
                  <input
                    className={styles.input}
                    value={bullInput}
                    onChange={e => setBullInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addListItem('bull', bullInput, setBullInput)}
                    placeholder="添加看多理由"
                  />
                  <button className={styles.addBtn} onClick={() => addListItem('bull', bullInput, setBullInput)}>+</button>
                </div>
              </div>

              {/* 看空 */}
              <div className={styles.field}>
                <label className={styles.label}>看空理由</label>
                <div className={styles.listItems}>
                  {(form.bear || []).map((item, i) => (
                    <div key={i} className={styles.listItem}>
                      <span>{item}</span>
                      <button className={styles.removeBtn} onClick={() => removeListItem('bear', i)}>×</button>
                    </div>
                  ))}
                </div>
                <div className={styles.listAdd}>
                  <input
                    className={styles.input}
                    value={bearInput}
                    onChange={e => setBearInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addListItem('bear', bearInput, setBearInput)}
                    placeholder="添加看空理由"
                  />
                  <button className={styles.addBtn} onClick={() => addListItem('bear', bearInput, setBearInput)}>+</button>
                </div>
              </div>
            </>
          )}

          {entryType === 'industries' && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>产业链</label>
                <textarea
                  className={styles.textarea}
                  value={form.valueChain || ''}
                  onChange={e => setForm(f => ({ ...f, valueChain: e.target.value }))}
                  placeholder="上游 → 中游 → 下游"
                  rows={3}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>趋势</label>
                <div className={styles.listItems}>
                  {(form.trends || []).map((item, i) => (
                    <div key={i} className={styles.listItem}>
                      <span>{item}</span>
                      <button className={styles.removeBtn} onClick={() => removeListItem('trends', i)}>×</button>
                    </div>
                  ))}
                </div>
                <div className={styles.listAdd}>
                  <input
                    className={styles.input}
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addListItem('trends', noteInput, setNoteInput)}
                    placeholder="添加趋势"
                  />
                  <button className={styles.addBtn} onClick={() => addListItem('trends', noteInput, setNoteInput)}>+</button>
                </div>
              </div>
            </>
          )}

          {entryType === 'frameworks' && (
            <div className={styles.field}>
              <label className={styles.label}>框架描述</label>
              <textarea
                className={styles.textarea}
                value={form.description || ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="详细描述这个研究框架"
                rows={6}
              />
            </div>
          )}

          {/* 笔记 */}
          <div className={styles.field}>
            <label className={styles.label}>笔记</label>
            <div className={styles.listItems}>
              {(form.notes || []).map((item, i) => (
                <div key={i} className={styles.listItem}>
                  <span>{item}</span>
                  <button className={styles.removeBtn} onClick={() => removeListItem('notes', i)}>×</button>
                </div>
              ))}
            </div>
            <div className={styles.listAdd}>
              <input
                className={styles.input}
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (entryType !== 'industries') && addListItem('notes', noteInput, setNoteInput)}
                placeholder="添加笔记"
              />
              <button className={styles.addBtn} onClick={() => addListItem('notes', noteInput, setNoteInput)}>+</button>
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
            {entry && (
              <button className={styles.cancelBtn} onClick={() => { setEditing(false); setForm(entry) }}>
                取消
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 只读模式 */
        <div className={styles.detail}>
          {entry?.name && <h2 className={styles.detailName}>{entry.name}</h2>}
          {entry?.summary && <p className={styles.detailSummary}>{entry.summary}</p>}

          {entryType === 'companies' && entry?.score && (
            <div className={styles.scoreDisplay}>
              {Object.entries(entry.score).map(([key, val]) => (
                <div key={key} className={styles.scoreChip}>
                  <span className={styles.scoreChipLabel}>
                    {key === 'moat' ? '护城河' : key === 'growth' ? '成长性' : key === 'risk' ? '风险' : '估值'}
                  </span>
                  <span className={styles.scoreChipValue}>{val}/5</span>
                </div>
              ))}
            </div>
          )}

          {entryType === 'companies' && (
            <div className={styles.bullBear}>
              <div className={styles.bullSection}>
                <div className={styles.bullBearLabel}>看 多</div>
                <ul className={styles.bullBearList}>
                  {(entry?.bull || []).map((item, i) => <li key={i}>{item}</li>)}
                  {(!entry?.bull || entry.bull.length === 0) && <li className={styles.emptyItem}>暂无</li>}
                </ul>
              </div>
              <div className={styles.bearSection}>
                <div className={styles.bullBearLabel}>看 空</div>
                <ul className={styles.bullBearList}>
                  {(entry?.bear || []).map((item, i) => <li key={i}>{item}</li>)}
                  {(!entry?.bear || entry.bear.length === 0) && <li className={styles.emptyItem}>暂无</li>}
                </ul>
              </div>
            </div>
          )}

          {entryType === 'industries' && entry?.valueChain && (
            <div className={styles.fieldDisplay}>
              <div className={styles.fieldLabel}>产业链</div>
              <div className={styles.fieldValue}>{entry.valueChain}</div>
            </div>
          )}

          {entryType === 'frameworks' && entry?.description && (
            <div className={styles.fieldDisplay}>
              <div className={styles.fieldLabel}>框架描述</div>
              <div className={styles.fieldValue}>{entry.description}</div>
            </div>
          )}

          {entry?.notes?.length > 0 && (
            <div className={styles.fieldDisplay}>
              <div className={styles.fieldLabel}>笔记</div>
              <ul className={styles.noteList}>
                {entry.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}

          {entry?.changelog?.length > 0 && (
            <div className={styles.changelog}>
              <div className={styles.fieldLabel}>变更记录</div>
              {entry.changelog.slice(0, 10).map((c, i) => (
                <div key={i} className={styles.changelogItem}>
                  <span className={styles.changelogDate}>{c.date}</span>
                  <span className={styles.changelogAction}>{c.action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
