# Raw Sources Layer

> **Immutable original-source area. The agent only reads from here, never modifies.**

Following the [Karpathy LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f):

```
Raw sources (here)  ──ingest──▶  Wiki (companies/, industries/, ...)
   ↑                                  ↑
immutable                       derived, evolvable, rewritable
```

## Subdirectory conventions

| Subdir | Purpose | Naming |
|---|---|---|
| `earnings/` | Earnings transcripts / 8-K / press releases | `{TICKER}-{QUARTER}.{ext}` (e.g. `AAPL-Q1-FY26.txt`) |
| `articles/` | Articles, tweets, blog posts, research notes | `{YYYY-MM-DD}-{source}-{slug}.md` |
| `filings/` | SEC 10-K / 10-Q / S-1 PDFs | `{TICKER}-{form}-{date}.pdf` |
| `research-notes/` | Raw research notes from conversations (pre-wiki) | `{YYYY-MM-DD}-{topic}.md` |

## Rules

1. **Never modify** — once written, only append a metadata header (source URL, ingest time)
2. **Must produce wiki updates** — every raw file must trigger at least one wiki page change, otherwise it's dead data
3. **Stable paths** — wiki pages reference raw via relative paths: `[source](../raw/earnings/AAPL-Q1-FY26.txt)`
4. **Large files** — anything >5MB (e.g. PDFs) should be linked, not committed; use external object storage or skip git tracking

## Metadata header convention

When the agent saves a raw file, it should prepend (and only this prepend may be modified later):

```
---
source_url: https://...
fetched_at: 2026-05-08T14:23:00Z
fetched_by: openorder-skill
notes: (optional human note)
---

[original content below, never modified]
```
