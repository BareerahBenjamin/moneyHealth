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
      // 截断过长的错误信息（如 HTML 页面），避免前端渲染异常
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
  // 如果已有分析数据，一起传给后端避免重复拉取
  if (existingAnalysis && existingAnalysis.funds) {
    body.cached_analysis = existingAnalysis
  }
  return fetchWithTimeout(`${API_BASE}/api/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, 120000)
}

export async function explainConcept(concept) {
  const res = await fetch(`${API_BASE}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept }),
  });
  return res.json();
}

export async function getCryptoHistory(symbol, days = 30) {
  const res = await fetch(`${API_BASE}/api/crypto/${symbol}/history?days=${days}`);
  return res.json();
}

export async function verifyClaims(content) {
  const res = await fetch(`${API_BASE}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function analyzeSupplyChain(material, context = '') {
  const res = await fetch(`${API_BASE}/api/supply-chain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ material, context }),
  });
  return res.json();
}

export async function getStockInfo(stockCode) {
  const res = await fetch(`${API_BASE}/api/stock/${stockCode}`);
  return res.json();
}

export async function searchStock(keyword) {
  const res = await fetch(`${API_BASE}/api/stock/search/${encodeURIComponent(keyword)}`);
  return res.json();
}

// ========== 研究知识库（OpenOrder）==========

export async function getWikiIndex() {
  const res = await fetch(`${API_BASE}/api/wiki/index`);
  return res.json();
}

export async function getWikiEntries(type) {
  const res = await fetch(`${API_BASE}/api/wiki/${type}`);
  return res.json();
}

export async function getWikiEntry(type, id) {
  const res = await fetch(`${API_BASE}/api/wiki/${type}/${id}`);
  return res.json();
}

export async function saveWikiEntry(type, id, data) {
  const res = await fetch(`${API_BASE}/api/wiki/${type}/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteWikiEntry(type, id) {
  const res = await fetch(`${API_BASE}/api/wiki/${type}/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function searchWiki(q) {
  const res = await fetch(`${API_BASE}/api/wiki/search?q=${encodeURIComponent(q)}`);
  return res.json();
}

// ========== 交易日志 ==========

export async function getTrades(filters = {}) {
  const params = new URLSearchParams();
  if (filters.ticker) params.set('ticker', filters.ticker);
  if (filters.fromDate) params.set('from_date', filters.fromDate);
  if (filters.toDate) params.set('to_date', filters.toDate);
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/trades${qs ? '?' + qs : ''}`);
  return res.json();
}

export async function addTrade(data) {
  const res = await fetch(`${API_BASE}/api/trades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getTradeStats() {
  const res = await fetch(`${API_BASE}/api/trades/stats`);
  return res.json();
}

export async function getTradePnl() {
  const res = await fetch(`${API_BASE}/api/trades/pnl`);
  return res.json();
}
