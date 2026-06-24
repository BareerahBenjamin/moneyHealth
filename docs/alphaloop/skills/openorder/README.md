<div align="center">

# OpenOrder

### Order out of investment chaos.

**An open-source AI skill that turns every conversation into a permanent, compounding investment-research wiki.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cross-agent](https://img.shields.io/badge/works%20with-Claude%20Code%20%7C%20Cursor%20%7C%20Codex%20%7C%20Hermes%20%7C%20OpenCode-blue)](docs/compatibility.md)
[![Inspired by](https://img.shields.io/badge/inspired%20by-Karpathy%20LLM%20Wiki-purple)](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

```
                                    ┌─────────────┐
                                    │  YOUR EDGE  │
                                    │  COMPOUNDS  │
                                    └──────▲──────┘
                                           │
   ───►  earnings  ──┐                     │
   ───►  news       ─┤                     │
   ───►  filings    ─┼──►  AI agent  ──────┤
   ───►  tweets     ─┤        ▲            │
   ───►  research   ─┘        │            │
                              │            │
                       OpenOrder skill     │
                              │            │
                       ┌──────▼─────┐      │
                       │  WIKI      │──────┘
                       │  ~/openorder│
                       │  (markdown) │
                       └─────────────┘
```

</div>

---

## The problem

Every investor lives the same loop:

> Read a Goldman note. Skim 5 tweets. Listen to a podcast. Watch an earnings call. *Forget 90% of it by next week.* Repeat.

Most "AI for research" tools push you deeper into that loop — you upload PDFs to NotebookLM, you ask ChatGPT, the answer is great, then it **evaporates into chat history**. Next week you're re-deriving the same thesis from the same documents.

**That's not research. That's expensive forgetting.**

## The idea

OpenOrder makes your AI agent **maintain a persistent wiki** about your coverage universe — companies, industries, frameworks, earnings, theses — and **update it on every conversation**.

```
You:    "What did MSFT just say about capex?"
Agent:  [Reads INDEX.md → companies/MSFT.md → answers]
        [Detects new earnings → updates MSFT profile]
        [Appends to log.md: "2026-05-08 ingest | MSFT FY26 Q3 capex guide"]

You:    "And how does that affect NVDA?"
Agent:  [Already knows from your wiki that NVDA is 25% of MSFT's
         AI capex → cross-references → updates both files]
```

Your knowledge **compounds**. The wiki gets richer every conversation. You stop asking the same questions twice.

> *"The wiki is a persistent, compounding artifact. The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read."*
> — Andrej Karpathy, [LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

OpenOrder is a production-ready implementation of that pattern — specialized for investment research and pre-wired to work with every major AI coding agent.

---

## Quick Start

```bash
git clone https://github.com/realnaka/OpenOrder.git
cd OpenOrder
./install.sh
```

That's it. The installer:
1. Detects which AI agents you have installed (Claude Code, Cursor, Codex, Hermes, OpenCode, OpenClaw)
2. Symlinks the skill into each agent's expected location
3. Initializes an empty wiki at `~/openorder/` with `INDEX.md`, `log.md`, `raw/`, and templates
4. Sets up local `git` for free version history

**Now open any AI agent** and say:

> *"What's NVDA trading at and what's the latest thesis?"*

The skill auto-triggers. The agent reads your wiki, answers, and writes back any new insights.

---

## What it does (the 5 operations)

| Operation | When it runs | What happens |
|---|---|---|
| **READ** | Every ticker / industry / framework mention | Agent reads `INDEX.md` then drills into relevant files before answering |
| **INGEST** | You paste a URL / earnings / tweet | 5-step flow: fetch full text → store in `raw/` → extract entities → update wiki → append `log.md` |
| **WRITE** | New insight emerges in conversation | Agent updates company profile / framework / portfolio + timestamps everything |
| **LOG** | Every write | Append-only `log.md` entry → `grep "^## \[" log.md` shows your timeline |
| **LINT** | You say "lint wiki" or monthly | Health-check report: contradictions, stale data, orphan files, missing pages, data gaps |

See [`SKILL.md`](SKILL.md) for the full specification.

---

## Three-Layer Architecture

```
~/openorder/
│
├── raw/                       ← Layer 1: immutable sources
│   ├── earnings/                Earnings transcripts, 8-Ks
│   ├── articles/                Tweets, blog posts, research notes
│   ├── filings/                 SEC PDFs
│   └── research-notes/          Raw scratch from conversations
│
├── INDEX.md                   ← Layer 2: your living wiki
├── log.md                       (LLM-owned, continuously maintained)
├── companies/{TICKER}.md
├── industries/{NAME}/
├── frameworks/{NAME}.md
├── earnings/{TICKER}-{Q}.md
├── portfolios/{NAME}.md
└── templates/

~/.claude/skills/openorder/    ← Layer 3: the schema (this repo)
└── SKILL.md
```

**Why three layers?**
- **Raw is sacred**: you can always re-derive the wiki from raw sources. Raw never changes.
- **Wiki is fluid**: gets rewritten as understanding evolves.
- **Schema is portable**: install in 5 seconds across any agent.

---

## Cross-agent compatibility

OpenOrder is **agent-agnostic**. The same skill, the same wiki, the same data — across every tool you use.

| Agent | Mechanism | Auto-detected by `install.sh` |
|---|---|---|
| **[Claude Code](https://claude.ai/code)** (Anthropic) | `SKILL.md` (native) | ✅ |
| **[Cursor](https://cursor.com)** (IDE + CLI) | `SKILL.md` (compatible) | ✅ |
| **[Codex CLI](https://github.com/openai/codex)** (OpenAI) | `SKILL.md` + `AGENTS.md` | ✅ |
| **[Hermes Agent](https://github.com/NousResearch/hermes-agent)** (NousResearch) | `AGENTS.md` + `~/.hermes/skills/` | ✅ |
| **[OpenCode](https://opencode.ai)** (sst) | `AGENTS.md` | ✅ |
| **[OpenClaw](https://github.com/openclaw)** | `AGENTS.md` | ✅ |
| **[Aider](https://aider.chat)** | `CONVENTIONS.md` symlink (per-project) | ⚠️ manual |
| **[Cline](https://github.com/cline/cline) / [Roo Code](https://github.com/RooVetGit/Roo-Cline)** | `.clinerules` (per-project) | ⚠️ manual |
| **Anything else supporting `AGENTS.md`** | `AGENTS.md` | ✅ via `~/.config/<agent>/` |

Full setup details: [`docs/compatibility.md`](docs/compatibility.md).

---

## Why this beats RAG / NotebookLM / ChatGPT-with-files

| | OpenOrder | RAG / NotebookLM |
|---|---|---|
| **Knowledge accumulation** | ✅ Wiki compounds every session | ❌ Re-derived every query |
| **Cross-source synthesis** | ✅ Pre-computed, stored in wiki | ❌ Re-discovered each time |
| **Contradiction tracking** | ✅ Flagged in wiki, logged | ❌ Lost between sessions |
| **Evolving thesis** | ✅ Bull/bear updated as you learn | ❌ Stuck at upload time |
| **Cross-agent portable** | ✅ Same wiki across Claude/Cursor/Codex/etc | ❌ Locked to one product |
| **Version history** | ✅ git out of the box | ❌ Black box |
| **Privacy** | ✅ 100% local markdown | ⚠️ Cloud upload |
| **Cost** | ✅ Free (your existing agent's API key) | 💲 Per-product subscription |

---

## Sample use cases

- **Personal investor** — track a 30-stock coverage universe with bull/bear theses that update as earnings drop
- **Buy-side analyst** — maintain a "structural shorts" wiki with sourced bear cases and conviction scores
- **Sell-side researcher** — keep a living industry map with peer comparison tables that auto-refresh
- **Crypto researcher** — track 50 protocols with TVL trends, governance changes, and tokenomics edits
- **Family office / investment club** — share a wiki across teammates via a private GitHub repo

---

## Customization (fork to your domain)

OpenOrder ships investment-research as the default domain, but the architecture is general. To adapt:

1. Edit `SKILL.md` Section 3 to swap the trigger keywords for your field
2. Edit `examples/company-template.md` to match your entity type (drug pipeline / property / DeFi protocol / academic paper)
3. Edit `examples/INDEX.example.md` to match your taxonomy

See [`docs/customize.md`](docs/customize.md) for adapted examples (crypto, biotech, real estate, academic literature).

---

## What's NOT in this repo

OpenOrder ships only the skill + templates. It does **not** include:

- Real research data (your wiki is local-only at `~/openorder/`, never committed here)
- A specific opinion on any company or industry
- Telemetry, analytics, or network calls
- A specific scoring framework — just an abstract scaffold; bring your own methodology

---

## Roadmap

- [ ] `examples/` for non-investment domains (crypto, biotech)
- [ ] Optional `git-sync` hook for multi-machine / team collaboration
- [ ] Companion VS Code / Obsidian plugin for visual wiki browsing
- [ ] Lint command CLI (`openorder lint`) outside the agent
- [ ] CI template for keeping wiki fresh against earnings calendars

PRs welcome. See [`AGENTS.md`](AGENTS.md) for contributor / agent guidance.

---

## Credits

OpenOrder's three-layer architecture, `log.md` timeline, Lint operation, and Ingest workflow are direct implementations of **Andrej Karpathy's [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** (2026).

The investment-research framing, cross-agent install scaffolding, and packaged templates are original to OpenOrder.

The pattern itself dates back to **Vannevar Bush's Memex** (1945) — a personal, curated knowledge store with associative trails between documents. Bush couldn't solve the maintenance problem. LLMs can.

---

## License

MIT. See [`LICENSE`](LICENSE).
