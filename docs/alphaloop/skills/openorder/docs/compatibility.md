# Cross-Agent Compatibility Guide

OpenOrder is designed to work with **any AI coding agent that supports `SKILL.md` or `AGENTS.md`**. This document covers the agents `install.sh` auto-detects and how to wire up the rest manually.

## Auto-detected by `install.sh`

The installer creates symlinks (so you can `git pull` updates and every agent picks them up automatically).

### Claude Code (Anthropic)

```
~/.claude/skills/openorder/  →  symlink to repo
```

Skill is loaded automatically when its `description` matches conversation keywords. See [Claude Code skills docs](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) for the loading model.

### Cursor (IDE + CLI)

```
~/.cursor/skills-cursor/openorder/  →  symlink to repo
```

User-level skills work in **every Cursor project** automatically. Project-level skills (`.cursor/skills/`) are not used by OpenOrder by default.

### Codex CLI (OpenAI)

```
~/.codex/skills/openorder/  →  symlink to repo
```

Codex respects both `SKILL.md` (frontmatter-based) and `AGENTS.md` (project-level instructions). The repo ships both.

### Hermes Agent (NousResearch)

```
~/.hermes/skills/openorder/  →  symlink to repo
```

Hermes auto-loads skills from `~/.hermes/skills/` and `~/.hermes/optional-skills/`. The repo ships an `AGENTS.md` that Hermes recognizes.

### OpenCode (sst)

```
~/.config/opencode/agent/openorder.md  →  symlink to AGENTS.md
```

OpenCode follows the [`AGENTS.md` convention](https://github.com/openai/codex/blob/main/AGENTS.md). The installer places the file at the global agent config path.

### OpenClaw

```
~/.openclaw/skills/openorder/  →  symlink to repo
```

OpenClaw's three-layer (Channel/Brain/Body) architecture loads skills from its body layer.

## Manual setup (per-project agents)

### Aider

Aider uses a project-local `CONVENTIONS.md`. To add OpenOrder to a specific repo:

```bash
cd /path/to/your/repo
ln -s ~/path/to/OpenOrder/AGENTS.md CONVENTIONS.md
```

Or merge OpenOrder rules into your existing `CONVENTIONS.md`.

### Cline / Roo Code

Both use `.clinerules` in the project root:

```bash
cd /path/to/your/repo
ln -s ~/path/to/OpenOrder/AGENTS.md .clinerules
```

### Continue.dev

Continue uses `~/.continue/config.json`. Add a custom rule referencing the OpenOrder skill:

```json
{
  "systemMessage": "Always check ${OPENORDER_HOME}/INDEX.md before answering investment questions. See full skill at ~/.config/openorder/SKILL.md."
}
```

### Other AGENTS.md-aware agents

Most modern agents (Goose, Helix-AI, etc.) follow the `AGENTS.md` convention. Symlink:

```bash
ln -s /path/to/OpenOrder/AGENTS.md ~/path/to/agent/config/AGENTS.md
```

## Verifying the install

After installing, run:

```bash
ls -la ~/.claude/skills/openorder           2>/dev/null && echo "✓ Claude Code"
ls -la ~/.cursor/skills-cursor/openorder    2>/dev/null && echo "✓ Cursor"
ls -la ~/.codex/skills/openorder            2>/dev/null && echo "✓ Codex"
ls -la ~/.hermes/skills/openorder           2>/dev/null && echo "✓ Hermes"
ls -la ~/.config/opencode/agent/openorder.md 2>/dev/null && echo "✓ OpenCode"
ls -la ~/.openclaw/skills/openorder         2>/dev/null && echo "✓ OpenClaw"
```

Then open a fresh chat in any installed agent and try:

> *"What's NVDA trading at?"*

If the agent autonomously reads `~/openorder/INDEX.md` before answering, the skill is wired correctly.

## Uninstall

```bash
./install.sh --uninstall
```

This removes all symlinks. Your wiki at `~/openorder/` is left untouched.

## Reporting compatibility issues

If you tested OpenOrder with an agent not listed here, please open an issue or PR — we'd love to add it to the matrix.
