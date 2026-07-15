# Benefit claims and evidence

Policy for public copy — README, npm package openings, and adoption material. Parent: [Personas and priority tiers](../personas-and-priority-tiers.md).

## Claim tiers

| Tier                        | Rule                                                                        | Landing page (README) | Deeper shards                              |
| --------------------------- | --------------------------------------------------------------------------- | --------------------- | ------------------------------------------ |
| **A — Mechanism**           | What the tool literally does                                                | Allowed (brief)       | Allowed                                    |
| **B — Conditional outcome** | Benefit when the user follows documented workflow; qualify with "when you…" | Allowed (WIIFM lines) | Allowed with qualification                 |
| **C — Unmeasured outcome**  | Speed, quality, token %, "easier LLM coding" without data                   | **Forbidden**         | Adoption stories or future benchmarks only |

## Common corrections

- **`export --llm` scopes context** — Scope comes from **workflow** ([usage model](./usage-model.md): read one shard). `export --llm` strips comments and banners from whatever you export.
- **`refs lookup` / retrieval as WIIFM** — Forbidden. Doc discovery is host search; do not claim a MDCP lookup verb for context size or accuracy.
- **Ship faster with agents** — Tier C; use adoption stories or measured outcomes.
- **Strips tokens for scoped context** — Split: export **strips HTML comments and banners** (Tier A); **smaller per-turn reads when agents load one shard** (Tier B, [context-size measurement](#context-size-measurement-dogfood-repo)).

## Context-size measurement (dogfood repo)

**Source:** [context-size-dogfood.csv](./context-size-dogfood.csv)

Regenerate after compile:

```bash
pnpm build && pnpm docs:compile:repo && pnpm bench:context-size
```

### How to read the numbers

- **Sharding** can reduce per-turn context **when agents read one feature shard instead of the full features monolith** — see `median_shard_pct_of_monolith` in the CSV.
- **`export --llm`** removes comment, banner, and frontmatter bytes (`llm_strip_delta_chars`) — a smaller delta than shard scoping; do not conflate the two.
- MDCP does **not** stop an agent from reading the whole monolith — discipline and Agent Skill instructions matter.

### Tier B wording (dogfood measurement, 2026-06-25)

On this repository, the median `docs/features/` shard is **~4.4%** of the compiled features monolith by character count (median ~4.6k chars vs ~105k chars). When agents read one shard instead of the full monolith, per-turn context can be smaller — if they follow the [usage model](./usage-model.md). MDCP does not enforce that discipline; the Agent Skill and your workflow do.
`export --llm` removed **0** bytes on the features guide in this run (no HTML comments or banners in that output). Do not conflate export stripping with shard scoping.

## Evidence elsewhere

- **`mdcp check` catches orphans and broken refs** — Feature catalog; core tests
- **OpenAPI analogy** — Design intent in [Vision and roadmap](./00-vision-and-roadmap.md); not LF membership

## Adoption anecdotes

Qualitative outcomes belong in [GitHub adoption stories](https://github.com/betsalel-williamson/mdcp/issues/new?template=adoption-story.yml) — not unverified bullets on the README.

**First external Champion validation (2026-06, anonymous):** A technical evaluator with no prior MDCP use reported that [Vision and roadmap](./00-vision-and-roadmap.md) explained what the tool is and why well enough to proceed; the README landing one-liner alone was not sufficient. This backs the P0 adoption onboarding work in [Personas and priority tiers](../personas-and-priority-tiers.md#p0-adoption--evaluator-onboarding-validated-2026-06) — vision link on landing and Champion eval path in get-started.
