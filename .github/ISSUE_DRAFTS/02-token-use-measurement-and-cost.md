# Issue draft 2 — Token use, cost, and verification economics

Copy into **Feedback or question** (`.github/ISSUE_TEMPLATE/02-feedback.yml`).

## Title

```text
[Feedback] Measure token / context cost: more or less to ship a feature, and at what scale?
```

## Value-add priority (dropdown)

`P1 — high near-term value`

## Suggested labels (after create)

`feedback`, `documentation`, `protocol`, `priority:P1`

## Summary

```markdown
## Question

How are we measuring token (or context) use today? Bottom line for adopters: will developing a feature with MDCP use **more** or **less** tokens / inference cost on average than a traditional monolith-docs workflow — and **at what scale** does that tip?

Downstream product pressure: as generation gets cheaper and humans focus more on **cost constraints**, teams will prefer translating ideas into working product with **minimized cost** and flexible timing — often a **cheap system running overnight** over an expensive system that blows the weekly budget and leaves no room for more work.

## What exists today

Token/context efficiency is mostly a **usage-model claim**, not a measurement product:

- Agents are steered to host search → **one shard** ([usage-model](docs/features/protocol/usage-model.md)); MDCP does not enforce that
- Evidence policy forbids unmeasured “token %” on landing (Tier C) ([benefit-claims-and-evidence](docs/features/protocol/benefit-claims-and-evidence.md))
- Dogfood metric is **characters**, not tokenizer tokens: `pnpm bench:context-size` → [context-size-dogfood.csv](docs/features/protocol/context-size-dogfood.csv) — median feature shard ≈ **4.4%** of features monolith (2026-06-25)
- Token-strip `export --llm` was **removed** (ADR 0001); CSV still has stale LLM-export columns
- #160 (review-bench): token counts alone are the wrong headline; people-time / HIL may matter more; cost as **guardrail**, not pitch
- Compile benches (#64/#67) measure CLI latency/scale, not LLM tokens or $

## MDCP’s job in the cost picture

MDCP holds durable **context and intent** so humans and AI can reason about the system and audit as-built behavior against high-level specs. Tight constraints in Markdown should migrate to **tests / harnesses / QA in code** — enforceable without burning inference on every check.

Prefer **static analysis over inference** for routine gates (cheap, repeatable, overnight-friendly):

| Layer                    | Mechanism today                                        | Cost profile                     |
| ------------------------ | ------------------------------------------------------ | -------------------------------- |
| Structural doc integrity | `mdcp check` (orphans, refs, links, coverage, compile) | Deterministic CI                 |
| Evidence pointers        | `codeEvidence`, pointer shards                         | Compile-time; not semantic proof |
| Hard constraints         | Shards → tests / schemas / harnesses                   | Enforced in code                 |
| Semantic promise drift   | Two-level review, helpers, humans/agents               | Expensive if inference-default   |

**Honest gap (already stated):** we are **not sure** how to solve efficient **semantic** doc↔code drift verification (does prose still match behavior?). FAQ: MDCP does not magically force code↔docs compliance. Related open work: #157 (doc-sync inventory), #52 (compile/monolith diff), #160 (review evidence). Do not conflate that unsolved problem with “measure per-turn shard vs monolith chars.”

## Gaps for this issue

- No real **token** measurement (model tokenizer)
- No A/B vs traditional README / full monolith / dump-style corpora with agent traces
- No accounting for Skill pack overhead
- Savings are **conditional** on one-shard discipline
- Unclear unit: per-turn context, end-to-end feature development, or verification-loop $
- No written **static-first verification bar** for cost (when to allow overnight batch inference vs forbid PR-tax LLM audits)

## Decisions needed

1. Headline metric for adopters: chars vs tokens vs $ vs HIL review time?
2. Baseline corpora and scale axes (N shards, feature size, brownfield vs greenfield, concurrent agents)
3. Claim tier: what can move Tier C → Tier B (or adoption story) without overselling
4. Cost policy: default verification stack = static + tests; inference scarce / batchable
5. Explicit non-overlap with #64/#67 (compile latency) and coordination with #160 / #157 / #52

## Related

- #160 Review-bench MVP (HIL; tokens as guardrail)
- #157 Skill: doc-sync (coverage inventory — static-leaning direction)
- #52 Diff checking on compiled output
- #45 Usage model
- #59 / #60 MCP / hosted delivery
- Sibling draft: ontology / idea density (file as separate Feedback issue)
- ADR 0001 — removed token-strip export

## Acceptance (proposed)

- [ ] Written measurement method (tokenizer or chars, corpora, session definition, scale points)
- [ ] Regenerable script (extend/replace `bench:context-size`) + committed results; refresh stale LLM-export CSV columns post–ADR 0001
- [ ] Bottom-line guidance: when MDCP is expected to use fewer / more tokens or $, at what scale — with Benefit Claims tier wording
- [ ] Short design note on **static-first vs inference** for verification cost (link #52 / #157 / #160; do not claim semantic drift is solved)
- [ ] No Tier C “token %” on README until measured
```

## Additional context

```markdown
Practical stakeholder question: will this use more or less tokens to develop a feature, on average, and at what scale?

Maintainer working position (2026-07 exploration): prefer cheap overnight / static gates over budget-blowing inference; MDCP maximizes durable context for reasoning and audit; hard guarantees migrate to code QA; semantic doc↔code drift remains an open systems problem — attack with static inventories and tests first, inference as a scarce resource.

File via Feedback template; Track suggestion: **Maintenance** (adoption evidence / measurement); attach Performance track only if dedicated bench engine work dominates.
```
