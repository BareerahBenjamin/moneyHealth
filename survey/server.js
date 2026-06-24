const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3456;

// ── database ──
const fs = require('fs');
const dbPath = fs.existsSync('/data') ? '/data/survey.db' : path.join(__dirname, 'survey.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    answers TEXT NOT NULL,
    personality TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertStmt = db.prepare('INSERT INTO submissions (id, answers, personality) VALUES (?, ?, ?)');
const getStmt = db.prepare('SELECT * FROM submissions WHERE id = ?');
const listStmt = db.prepare('SELECT id, personality, created_at FROM submissions ORDER BY created_at DESC LIMIT ? OFFSET ?');
const allStmt = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC');
const countStmt = db.prepare('SELECT COUNT(*) as total FROM submissions');
const statsStmt = db.prepare(`
  SELECT personality, COUNT(*) as count
  FROM submissions
  GROUP BY personality
  ORDER BY count DESC
`);

// ── middleware ──
app.use(express.json());
app.use(require('cors')());
app.use(express.static(path.join(__dirname, 'public')));

// ── POST /api/survey ──
app.post('/api/survey', (req, res) => {
  const { answers, personality } = req.body;
  if (!answers || !personality) {
    return res.status(400).json({ error: '缺少 answers 或 personality 字段' });
  }
  const id = crypto.randomUUID();
  insertStmt.run(id, JSON.stringify(answers), JSON.stringify(personality));
  res.json({ ok: true, id });
});

// ── GET /api/survey/:id ──
app.get('/api/survey/:id', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).json({ error: '不存在' });
  res.json({
    id: row.id,
    answers: JSON.parse(row.answers),
    personality: JSON.parse(row.personality),
    created_at: row.created_at,
  });
});

// ── GET /api/surveys?page=1&size=20 ──
app.get('/api/surveys', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const size = Math.min(100, Math.max(1, parseInt(req.query.size) || 20));
  const offset = (page - 1) * size;
  const total = countStmt.get().total;
  const rows = listStmt.all(size, offset);
  res.json({
    total,
    page,
    size,
    pages: Math.ceil(total / size),
    items: rows.map(r => ({
      id: r.id,
      personality: JSON.parse(r.personality),
      created_at: r.created_at,
    })),
  });
});

// ── GET /api/surveys/all ──
app.get('/api/surveys/all', (req, res) => {
  const rows = allStmt.all();
  res.json(rows.map(r => ({
    id: r.id,
    answers: JSON.parse(r.answers),
    personality: JSON.parse(r.personality),
    created_at: r.created_at,
  })));
});

// ── GET /api/stats ──
app.get('/api/stats', (req, res) => {
  const total = countStmt.get().total;
  const rows = statsStmt.all();
  res.json({
    total,
    distribution: rows.map(r => ({
      personality: JSON.parse(r.personality),
      count: r.count,
    })),
  });
});

// ── share result page ──
app.get('/r/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'result.html'));
});

// ── fallback to index.html ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🪙 Survey server running at http://localhost:${PORT}`);
});
