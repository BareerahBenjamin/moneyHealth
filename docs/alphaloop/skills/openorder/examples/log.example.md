# Wiki Activity Log

> **Append-only timeline. Newest entries at the top.**
> Format: `## [YYYY-MM-DD HH:MM] {action} | {one-line summary}`
> Actions: `ingest`, `query`, `lint`, `decision`, `revise`, `framework`
> Quick view: `grep "^## \[" log.md | tail -10`

---

## [YYYY-MM-DD HH:MM] framework | Initial setup

- **Trigger**: OpenOrder installer
- **Files touched**: `INDEX.md`, `log.md`, `raw/README.md`
- **Key**: Wiki bootstrapped. Three-layer structure ready. Awaiting first ingest.
- **Raw source**: n/a

---

## Examples of typical entries (delete this section after first real entry)

### Ingest example
```
## [2026-05-08 14:23] ingest | EXAMPLE Q1 FY26 earnings transcript
- Trigger: User pasted transcript URL after earnings release
- Files touched: companies/EXAMPLE.md, earnings/EXAMPLE-Q1-FY26.md, INDEX.md
- Key findings:
  - Revenue $X.XB beat consensus $X.XB by Y%
  - Guidance raised on backlog tightening (specific quote in raw)
  - Management flagged supply constraint in component Z (matters for industry-wide)
- Raw source: raw/earnings/EXAMPLE-Q1-FY26.txt
```

### Query example (only logged when it produces an insight)
```
## [2026-05-08 16:00] query | EXAMPLE vs PEER cross-comparison
- Trigger: User asked "is EXAMPLE cheap vs PEER?"
- Files touched: companies/EXAMPLE.md (added "vs PEER" subsection)
- Key: Wiki had ratios for both; EXAMPLE trades 30% cheaper on EV/EBITDA but with lower growth
```

### Decision example
```
## [2026-05-09 09:45] decision | Added EXAMPLE to active portfolio
- Trigger: User said "Open 5% position in EXAMPLE"
- Files touched: portfolios/main-2026-05-09.md (created), companies/EXAMPLE.md (rationale linked)
- Key: Entry $XX.XX, 5% weight, thesis = bull case from companies/EXAMPLE.md §4
```

### Lint example
```
## [2026-05-15 18:00] lint | Monthly health check
- Trigger: User said "lint wiki"
- Files touched: log.md only (lint reports don't modify)
- Key findings:
  - 3 contradictions: target prices in companies/X.md vs portfolios/Y.md
  - 2 stale: companies/Z.md hasn't been updated since Q3 (now Q1 FY26)
  - 1 orphan: companies/W.md not referenced anywhere
  - 1 missing: "Anritsu" mentioned 5x but no profile
- Action: Generated lint-2026-05-15.md report; user to review
```

### Revise example
```
## [2026-05-20 11:00] revise | EXAMPLE bear case strengthened post-call
- Trigger: User pointed out missed gross margin compression detail
- Files touched: companies/EXAMPLE.md (bear case +1 argument, score lowered Y→Z)
- Key: WIP inventory growth outpaces revenue → margin pressure next quarter
```

### Framework example
```
## [2026-05-25 14:00] framework | Added "regulatory_risk" dimension to scoring
- Trigger: User decided geopolitics warrants an explicit factor
- Files touched: frameworks/main-framework.md, all 23 companies/*.md (rescored)
- Key: New 6th dimension added; weights rebalanced; documented in framework changelog
```
