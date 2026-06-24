import { useState, useEffect } from 'react'
import { getWikiEntries, searchWiki } from '../api'
import WikiDetail from './WikiDetail'
import styles from './Wiki.module.css'

const TABS = [
  { key: 'companies', label: '公 司' },
  { key: 'industries', label: '行 业' },
  { key: 'frameworks', label: '框 架' },
]

const TYPE_LABELS = {
  companies: '公司档案',
  industries: '行业分析',
  frameworks: '研究框架',
}

// 单数 -> 复数（API URL 用复数）
const TO_PLURAL = { company: 'companies', industry: 'industries', framework: 'frameworks' }
function toPlural(type) {
  return TO_PLURAL[type] || type
}

export default function Wiki() {
  const [tab, setTab] = useState('companies')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    getWikiEntries(tab)
      .then(data => setEntries(data.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
    setSearchResults(null)
    setSearchQuery('')
  }, [tab, refreshKey])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const data = await searchWiki(searchQuery.trim())
      setSearchResults(data.results || [])
    } catch {
      setSearchResults([])
    }
    setLoading(false)
  }

  const handleBack = () => {
    setSelectedEntry(null)
    setRefreshKey(k => k + 1)
  }

  if (selectedEntry) {
    return (
      <WikiDetail
        entryType={selectedEntry.type}
        entryId={selectedEntry.id}
        onBack={handleBack}
      />
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.sectionLabel}>研 究 知 识 库</div>
      <p className={styles.description}>
        持久化投资研究 wiki —— 知识积累一次，反复复利。
      </p>

      {/* 搜索栏 */}
      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="搜索公司、行业、框架..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className={styles.searchBtn} onClick={handleSearch}>搜索</button>
      </div>

      {/* 标签页 */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 搜索结果 */}
      {searchResults && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            搜索结果（{searchResults.length} 条）
            <button className={styles.clearBtn} onClick={() => setSearchResults(null)}>清除</button>
          </div>
          {searchResults.length === 0 ? (
            <div className={styles.empty}>没有找到匹配的内容</div>
          ) : (
            <div className={styles.cardGrid}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  className={styles.card}
                  onClick={() => setSelectedEntry({ type: toPlural(r.type), id: r.id })}
                >
                  <div className={styles.cardType}>{TYPE_LABELS[toPlural(r.type)] || r.type}</div>
                  <div className={styles.cardName}>{r.name}</div>
                  {r.summary && <div className={styles.cardSummary}>{r.summary}</div>}
                  <div className={styles.cardDate}>{r.lastUpdated}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 内容区 */}
      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            {TYPE_LABELS[tab]}
            <span className={styles.entryCount}>{entries.length} 条</span>
          </div>
          {entries.length === 0 ? (
            <div className={styles.empty}>
              暂无{TYPE_LABELS[tab]}，点击下方按钮创建
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {entries.map((entry, i) => (
                <div
                  key={i}
                  className={styles.card}
                  onClick={() => setSelectedEntry({ type: tab, id: entry.id })}
                >
                  <div className={styles.cardName}>{entry.name}</div>
                  <div className={styles.cardDate}>{entry.lastUpdated}</div>
                </div>
              ))}
            </div>
          )}
          <button
            className={styles.createBtn}
            onClick={() => {
              const id = prompt(`新建${TYPE_LABELS[tab]} — 请输入 ID（如 600519 / 半导体 / moat-scoring）:`)
              if (id?.trim()) {
                setSelectedEntry({ type: tab, id: id.trim() })
              }
            }}
          >
            + 新建{TYPE_LABELS[tab]}
          </button>
        </div>
      )}
    </div>
  )
}
