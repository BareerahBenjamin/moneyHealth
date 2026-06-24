# Credits & Lineage

## Direct inspiration

OpenOrder is a production-ready implementation of **Andrej Karpathy's LLM Wiki pattern**, published as a GitHub gist:

- **[The LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** by Andrej Karpathy

Karpathy's gist is intentionally abstract — "an idea file, designed to be copy-pasted to your own LLM Agent." OpenOrder is one concrete instantiation of that idea, specialized for investment research and pre-wired for cross-agent installation.

## What OpenOrder takes directly from Karpathy

- **Three-layer architecture**: Raw sources / Wiki / Schema
- **`INDEX.md` + `log.md` dual indexing** — content index + chronological timeline
- **Five operations**: Read / Ingest / Write / Lint, plus our explicit `Log` step
- **Markdown + git as the substrate** — no proprietary database, no vector store, no infrastructure
- **Obsidian-compatible** vault structure
- **Append-only `log.md` format** with grep-friendly prefix
- **The core insight**: "the wiki is a persistent, compounding artifact"

## What OpenOrder adds

- **Domain specialization**: investment-research framing with ticker/industry/earnings triggers built into `SKILL.md` Section 3
- **Cross-agent installer**: auto-detects Claude Code, Cursor, Codex, Hermes, OpenCode, OpenClaw, Aider, Cline, etc.
- **Mirrored `AGENTS.md`**: covers agents that follow the AGENTS.md convention (Hermes, OpenCode, Codex, Aider)
- **Explicit anti-patterns**: catalogued failure modes ("answered without reading", "wrote without logging", etc.)
- **Templates**: `company-template.md` and `earnings-template.md` with bull/bear balance and forensic structure
- **Self-check checklist**: closes the loop on every conversation
- **Customization guide**: ports OpenOrder to crypto, biotech, real estate, journaling, team wikis

## Deeper lineage

Karpathy explicitly traces the pattern back to **Vannevar Bush's Memex (1945)** — a personal, curated knowledge store with associative trails between documents. Bush's vision was closer to OpenOrder than to what the Web became: private, actively curated, with the connections between documents as valuable as the documents themselves.

> *"The part [Bush] couldn't solve was who does the maintenance. The LLM handles that."*
> — Andrej Karpathy

## Other influences

- **[Hermes Agent](https://github.com/NousResearch/hermes-agent)** by NousResearch — pioneered the persistent markdown-memory pattern at `~/.hermes/` and the `AGENTS.md` discovery convention
- **[Anthropic's Skills system](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)** — gave us the `SKILL.md` frontmatter pattern that triggers based on description matches
- **[OpenAI Codex's `AGENTS.md`](https://github.com/openai/codex/blob/main/AGENTS.md)** — established the convention of project-level agent instructions
- **[Obsidian](https://obsidian.md)** — the practical reference for what a markdown-vault knowledge base should look like, end-user side
- **[qmd](https://github.com/tobi/qmd)** by Tobi Lütke — local hybrid search over markdown files, useful when wikis grow past a few hundred pages

## License of OpenOrder

MIT — same spirit as the gists and tools that inspired it.

## How to cite OpenOrder

If you build something using OpenOrder, a one-line acknowledgment is appreciated:

> *"Built with [OpenOrder](https://github.com/realnaka/OpenOrder), an implementation of Karpathy's LLM Wiki pattern."*

If you write about it (blog post, tweet, paper), please link both this repo and Karpathy's original gist.
