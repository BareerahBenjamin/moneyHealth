# OpenOrder — Agent Instructions

> **For AI agents reading this repo**: this is a *skill*, not an application. It teaches you how to maintain a persistent investment-research wiki on the user's machine.

## What you are looking at

OpenOrder is a [Karpathy LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) implementation specialized for investment research. The full skill specification lives in [`SKILL.md`](SKILL.md). **Read it before doing anything else.**

This `AGENTS.md` exists so that agents that follow the [`AGENTS.md` standard](https://github.com/openai/codex/blob/main/AGENTS.md) (OpenAI Codex, OpenCode, Hermes, OpenClaw, Aider, etc.) can discover and load the skill consistently.

## Quick install (any agent)

```bash
git clone https://github.com/realnaka/OpenOrder.git
cd OpenOrder
./install.sh
```

The installer auto-detects which agents are present on your machine and creates the appropriate symlinks:

| Detected | Installed to |
|---|---|
| Claude Code | `~/.claude/skills/openorder/SKILL.md` |
| Cursor (IDE/CLI) | `~/.cursor/skills-cursor/openorder/` (symlink) |
| Codex CLI | `~/.codex/skills/openorder/` (symlink) |
| Hermes Agent | `~/.hermes/skills/openorder/` (symlink) |
| OpenCode | `~/.config/opencode/agent/openorder.md` |
| Aider | `CONVENTIONS.md` symlink in working repo |

It also initializes an empty wiki at `${OPENORDER_HOME:-$HOME/openorder}/` with `INDEX.md`, `log.md`, `raw/`, and the standard subdirectories.

## How to use as an agent

When the user starts a conversation that touches a stock ticker, industry, earnings, or investment framework:

1. **Always first**: `Read ${OPENORDER_HOME}/INDEX.md`
2. Then read the relevant sub-files (`companies/`, `industries/`, `frameworks/`, `earnings/`, `portfolios/`, `log.md`)
3. Answer using wiki content + real-time data
4. **Write back**: any new insight, decision, or ingested source must update the wiki AND append `log.md`
5. See [`SKILL.md`](SKILL.md) sections 4–8 for the full READ / INGEST / WRITE / LOG / LINT operations

## Key files in this repo

| File | Purpose |
|---|---|
| [`SKILL.md`](SKILL.md) | Full skill specification (the source of truth) |
| [`AGENTS.md`](AGENTS.md) | This file (mirror for `AGENTS.md`-aware agents) |
| [`README.md`](README.md) | Human-facing pitch and quick start |
| [`install.sh`](install.sh) | Cross-agent installer |
| [`examples/`](examples/) | Templates for `INDEX.md`, `log.md`, company profile, earnings deep-dive |
| [`docs/compatibility.md`](docs/compatibility.md) | Supported agents and their install paths |
| [`docs/customize.md`](docs/customize.md) | How to fork OpenOrder for other domains (crypto, biotech, etc.) |

## What this repo does NOT contain

- **No real research data**: this repo ships only the skill + templates. Your wiki content (company profiles, earnings analyses, portfolios) lives at `${OPENORDER_HOME}` on your local machine and is **never** committed to this public repo.
- **No personal data**: no real tickers, no real positions, no proprietary frameworks beyond the abstract scoring scaffold in templates.
- **No telemetry / network calls**: OpenOrder is pure markdown + your agent. Nothing phones home.

## Inheritance

OpenOrder builds directly on Karpathy's pattern:
- Three layers (Raw / Wiki / Schema) ← Karpathy
- `INDEX.md` + `log.md` dual indexing ← Karpathy
- Ingest / Query / Lint operations ← Karpathy

The investment-research domain framing, chokepoint-style scoring methodology in templates, and cross-agent install scaffolding are original to OpenOrder.

License: MIT. See [`LICENSE`](LICENSE).

---

**Read [`SKILL.md`](SKILL.md) next.**
