const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

// 带超时的 fetch（默认 90 秒）
async function fetchWithTimeout(url, opts = {}, timeoutMs = 90000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const msg = text && text.length > 200 ? text.slice(0, 200) + '...' : text
      throw new Error(msg || `请求失败 (${res.status})`)
    }
    return res.json()
  } catch (e) {
    clearTimeout(timer)
    if (e.name === 'AbortError') throw new Error('请求超时，请稍后重试')
    throw e
  }
}

export async function getFundInfo(fundCode) {
  return fetchWithTimeout(`${API_BASE}/api/fund/${fundCode}`)
}

export async function getCryptoPrice(symbols) {
  return fetchWithTimeout(`${API_BASE}/api/crypto/price?symbols=${symbols.join(',')}`)
}

export async function getCryptoDetail(symbol) {
  return fetchWithTimeout(`${API_BASE}/api/crypto/${symbol}`)
}

export async function analyzePortfolio(portfolio) {
  return fetchWithTimeout(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(portfolio),
  })
}

export async function generateReport(portfolio, existingAnalysis = null) {
  const body = { ...portfolio }
  if (existingAnalysis && existingAnalysis.funds) {
    body.cached_analysis = existingAnalysis
  }
  return fetchWithTimeout(`${API_BASE}/api/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, 240000)
}

export async function explainConcept(concept) {
  return fetchWithTimeout(`${API_BASE}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept }),
  }, 240000)
}

export async function getCryptoHistory(symbol, days = 30) {
  return fetchWithTimeout(`${API_BASE}/api/crypto/${symbol}/history?days=${days}`)
}

export async function verifyClaims(content) {
  return fetchWithTimeout(`${API_BASE}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  }, 240000)
}

export async function analyzeSupplyChain(material, context = '') {
  return fetchWithTimeout(`${API_BASE}/api/supply-chain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ material, context }),
  }, 240000)
}

export async function getStockInfo(stockCode) {
  return fetchWithTimeout(`${API_BASE}/api/stock/${stockCode}`)
}

export async function searchStock(keyword) {
  return fetchWithTimeout(`${API_BASE}/api/stock/search/${encodeURIComponent(keyword)}`)
}

// ========== 研究知识库（OpenOrder）==========

export async function getWikiIndex() {
  return fetchWithTimeout(`${API_BASE}/api/wiki/index`)
}

export async function getWikiEntries(type) {
  return fetchWithTimeout(`${API_BASE}/api/wiki/${type}`)
}

export async function getWikiEntry(type, id) {
  return fetchWithTimeout(`${API_BASE}/api/wiki/${type}/${id}`)
}

export async function saveWikiEntry(type, id, data) {
  return fetchWithTimeout(`${API_BASE}/api/wiki/${type}/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function deleteWikiEntry(type, id) {
  return fetchWithTimeout(`${API_BASE}/api/wiki/${type}/${id}`, {
    method: 'DELETE',
  })
}

export async function searchWiki(q) {
  return fetchWithTimeout(`${API_BASE}/api/wiki/search?q=${encodeURIComponent(q)}`)
}

// ========== 交易日志 ==========

export async function getTrades(filters = {}) {
  const params = new URLSearchParams();
  if (filters.ticker) params.set('ticker', filters.ticker);
  if (filters.fromDate) params.set('from_date', filters.fromDate);
  if (filters.toDate) params.set('to_date', filters.toDate);
  const qs = params.toString();
  return fetchWithTimeout(`${API_BASE}/api/trades${qs ? '?' + qs : ''}`)
}

export async function addTrade(data) {
  return fetchWithTimeout(`${API_BASE}/api/trades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function getTradeStats() {
  return fetchWithTimeout(`${API_BASE}/api/trades/stats`)
}

export async function getTradePnl() {
  return fetchWithTimeout(`${API_BASE}/api/trades/pnl`)
}
