# Customizing OpenOrder for Your Domain

OpenOrder ships **investment research** as the default domain, but the architecture is fully domain-agnostic. The 5 operations (READ / INGEST / WRITE / LOG / LINT) and the 3-layer structure (Raw / Wiki / Schema) work for any knowledge accumulation problem.

## What to change vs what to keep

| Layer | Domain-agnostic (keep as-is) | Domain-specific (customize) |
|---|---|---|
| `SKILL.md` Sec 2 (architecture) | ✅ | — |
| `SKILL.md` Sec 3 (triggers) | — | ✅ Replace tickers/industries with your domain keywords |
| `SKILL.md` Sec 4–8 (operations) | ✅ | — |
| `SKILL.md` Sec 6 (write rules) | ✅ | Mostly keep; adjust naming convention if needed |
| `templates/company-template.md` | — | ✅ Replace with your entity template |
| `templates/earnings-template.md` | — | ✅ Replace with your event template |
| `INDEX.md` taxonomy | — | ✅ Match your sub-categories |

## Example 1 — Crypto research wiki

**Triggers**: replace ticker patterns with token symbols (BTC, ETH, SOL, ...) and protocol names. Add: TVL, FDV, gov proposals, restaking, perp DEX, MEV, etc.

**Templates**:
- `entities/{TOKEN}.md` instead of `companies/{TICKER}.md`
- Sections: tokenomics / team / TVL trend / governance / catalysts / bull-bear / valuation (FDV vs MC, P/S, P/F)

**Industries → Verticals**:
- `verticals/perp-dex/`
- `verticals/restaking/`
- `verticals/stablecoins/`
- `verticals/prediction-markets/`

**Frameworks**:
- `frameworks/token-supply-overhang.md`
- `frameworks/protocol-revenue-quality.md`

**Events**:
- `events/{TOKEN}-{event-type}-{date}.md` (replaces `earnings/`)
- e.g. `ETH-shapella-2023-04.md`, `SOL-firedancer-mainnet-2025-q1.md`

## Example 2 — Biotech / drug pipeline wiki

**Triggers**: company names + drug names + indication names + phase keywords (Phase 1/2/3, NDA, BLA, FDA, EMA, AdCom, PDUFA, etc.)

**Templates**:
- `companies/{TICKER}.md` (similar)
- `drugs/{DRUG-NAME}.md` — pipeline drug profile (mechanism, indication, phase, competitors)
- `indications/{NAME}/README.md` — therapeutic area map

**Frameworks**:
- `frameworks/probability-of-success.md` (POS by phase + therapeutic area)
- `frameworks/regulatory-pathway-risk.md`

**Events**:
- `events/{COMPANY}-{trial}-{readout-date}.md`
- e.g. `BMRN-pkn005-phase3-readout-2026-q3.md`

## Example 3 — Real estate research wiki

**Triggers**: property addresses, MSA names, REIT tickers, "cap rate", "NOI", "rent comps", etc.

**Templates**:
- `properties/{address-slug}.md` — single asset
- `markets/{MSA}/README.md` — metro-level fundamentals
- `reits/{TICKER}.md` — public REIT
- `frameworks/cap-rate-decompose.md`

## Example 4 — Personal journal / quantified self

**Triggers**: "today I", "yesterday I", "I'm working on", "feeling", "energy", health metrics

**Templates**:
- `entities/people/{name}.md` — relationships
- `entities/projects/{name}.md` — ongoing work
- `concepts/{name}.md` — recurring ideas / patterns
- `frameworks/wheel-of-life.md`

**Events**:
- `journal/{YYYY-MM-DD}.md` (daily)

## Example 5 — Internal team knowledge base

**Triggers**: customer names, project names, codebase modules, OKRs

**Templates**:
- `customers/{name}.md`
- `projects/{name}.md`
- `decisions/{YYYY-MM-DD}-{topic}.md` (ADRs)
- `runbooks/{service}.md`

**Events**:
- `incidents/{YYYY-MM-DD}-{service}.md`

## Step-by-step customization

1. **Fork or copy** the OpenOrder repo
2. **Edit `SKILL.md` Section 3** — swap the trigger keyword categories for your domain
3. **Edit `examples/company-template.md`** — rename entity / change sections
4. **Edit `examples/INDEX.example.md`** — match your taxonomy
5. **Optionally rename** the skill (`name: openorder` → `name: my-wiki`)
6. **Run `./install.sh`** — your customized version installs across all agents

## Multi-domain support

Want both an investment wiki AND a personal journal in the same agent? Install OpenOrder twice with different `name`s:

```bash
# Default investment install
./install.sh

# Custom personal journal install
git clone https://github.com/realnaka/OpenOrder.git my-journal
cd my-journal
sed -i '' 's/name: openorder/name: personal-journal/' SKILL.md
sed -i '' 's/openorder/personal-journal/g' install.sh
OPENORDER_HOME=~/journal ./install.sh
```

Both skills coexist; their triggers are disjoint enough that the right one fires.

## Sharing your customization

If you build a domain template (crypto / biotech / etc.), please open a PR adding it to `examples/domains/{your-domain}/`. The community benefits.
