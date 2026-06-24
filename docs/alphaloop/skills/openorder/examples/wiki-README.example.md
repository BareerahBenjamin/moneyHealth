# {Your Wiki Name}

> **A persistent investment-research wiki maintained by AI agents via the [OpenOrder](https://github.com/realnaka/OpenOrder) skill.**

## Quick links

- [`INDEX.md`](INDEX.md) — start here
- [`log.md`](log.md) — what changed and when
- [`raw/`](raw/) — original sources (immutable)
- [`companies/`](companies/) — entity profiles
- [`industries/`](industries/) — sector deep-dives
- [`frameworks/`](frameworks/) — your scoring methodology
- [`earnings/`](earnings/) — event deep-dives
- [`portfolios/`](portfolios/) — position records
- [`templates/`](templates/) — copy-paste scaffolds

## How to use

1. **Open any AI agent** with OpenOrder installed (Claude Code, Cursor, Codex, Hermes, OpenCode, OpenClaw, etc.)
2. **Just talk normally** — say a ticker name, paste a news URL, ask a thesis question
3. The agent will auto-read this wiki, answer using it, and write back any new insights

## Browse with Obsidian (optional, recommended)

1. Install [Obsidian](https://obsidian.md)
2. Open this folder as a vault: `File → Open folder as vault → {this directory}`
3. Optionally exclude `raw/` from indexing in `Settings → Files & Links → Excluded files`
4. Use the Graph view to see how your knowledge connects

## Sync across machines (optional)

```bash
cd {this directory}
gh repo create my-wiki --private --source . --push
# On another machine:
git clone git@github.com:{you}/my-wiki.git ~/openorder
```

Pair with the OpenOrder skill installed there and your knowledge follows you everywhere.

---

*This README was created by `OpenOrder install.sh`. Edit freely — your AI agent will keep it relevant.*
