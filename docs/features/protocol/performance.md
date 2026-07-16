# Performance goals and review

Latency targets and scaling expectations for MDCP compile, validation, and agent query paths. P0+P1 shipped in [#64](https://github.com/betsalel-williamson/mdcp/issues/64); deferred P2+ tracked in [#67](https://github.com/betsalel-williamson/mdcp/issues/67).

MDCP is designed for **full programs** — hundreds of shards across multiple guides with dense cross-links — while keeping interactive agent loops and CI gates fast. This page records measured baselines, proposed SLOs, known bottlenecks, and the optimization roadmap.

## Why performance matters

| Actor                    | Hot path                        | Expectation                                        |
| ------------------------ | ------------------------------- | -------------------------------------------------- |
| LLM doc author           | edit shard → `check`            | Compile+check under a few seconds during authoring |
| CI                       | `mdcp check --require-lint`     | PR gate completes before reviewer context switches |
| Agent (context consumer) | Host search → single-shard read | No full-repo compile on every query                |

The [usage model](./usage-model.md) prefers granular context (one shard at a time). Performance work keeps that model viable as repos grow.

## Measured results (dogfood `docs/` repo)

**Source of truth:** [performance-dogfood.csv](./performance-dogfood.csv)

Regenerate after toolchain changes:

```bash
pnpm build && pnpm bench:dogfood
```

The CSV is written by `scripts/bench-dogfood-performance.mjs` at the repo root. Each row is one operation with pre-P0 and post-P0 values side by side.

| Column               | Meaning                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `operation`          | Command or phase measured                                                                 |
| `tier`               | SLO tier (1–4) when applicable; blank for component timings                               |
| `slo_target`         | Normative target text from the SLO tables below                                           |
| `slo_shards`         | Shard count the SLO is defined at (200 or 500); dogfood has ~64 shards                    |
| `pre_p0_value`       | Historical baseline before P0 optimizations                                               |
| `post_p0_value`      | Live measurement from the bench script (median of 3 CLI runs or single in-process sample) |
| `value_unit`         | `ms`, `ms/link`, or `count`                                                               |
| `improvement_factor` | `pre_p0_value / post_p0_value` when units match and post > 0                              |
| `status`             | `met`, `miss`, or `open (P2)` vs the SLO for that row                                     |
| `pre_p0_source`      | `github-issue-64` — not re-measured; do not edit by hand                                  |
| `post_p0_source`     | Bench script id and date — updates when you run `pnpm bench:dogfood`                      |
| `notes`              | Measurement method (CLI wall clock vs in-process, peer linters included or not)           |
| `recorded_at`        | Date the post-P0 column was last generated                                                |

**Pre-P0** values come from [GitHub #64](https://github.com/betsalel-williamson/mdcp/issues/64) when the toolchain compiled **3×** per `check` / `compile` and re-read target files per cross-file `#fragment` link. **Post-P0** values are measured on the reference repo (~64 shards, 4 guides, ~296 source links, ~357 compiled links).

Do not hand-edit timing cells in this doc — update the CSV via the bench script.

## Scaling projections

Synthetic fixtures (single guide + glossary, simple intra-guide links). **Projections only** — not in the CSV until P3 benchmark fixtures land.

| Shards | Links/shard | Core total (compile + lint) |
| ------ | ----------- | --------------------------- |
| 64     | 5           | ~74 ms                      |
| 100    | 5           | ~160 ms                     |
| 200    | 5           | ~543 ms                     |
| 500    | 5           | ~3.1 s                      |
| 200    | 20          | ~4.2 s                      |

Scaling is **superlinear** beyond ~200 shards — repeated file reads and link-graph walks dominate.

Real multi-guide repos with publish outputs (`compile.outputFile`), cross-guide rewriting, and compile hooks are roughly **10× slower per shard** than synthetic fixtures. Extrapolated full programs (pre-P0 constant factor):

| Scale      | Core compile + lint | Full `check` (with peers) |
| ---------- | ------------------- | ------------------------- |
| 200 shards | ~5–15 s             | ~15–30 s                  |
| 500 shards | ~15–45 s            | ~45–90 s                  |

Re-benchmark at 200/500 shards in P3; compare against SLO columns in the CSV.

## Service level objectives (SLOs)

Normative targets below. Measured compliance for dogfood is in [performance-dogfood.csv](./performance-dogfood.csv).

### Tier 1 — Interactive (agent authoring loop)

| Operation                | Target                    | Rationale                                    |
| ------------------------ | ------------------------- | -------------------------------------------- |
| `compile` (single guide) | **< 500 ms** @ 200 shards | Fast feedback while editing one feature area |
| `compile` (full repo)    | **< 2 s** @ 200 shards    | Pre-push sanity check                        |

### Tier 2 — CI gate (core mdcp only, no peers)

| Operation                                          | Target                  | Rationale                            |
| -------------------------------------------------- | ----------------------- | ------------------------------------ |
| `check` (orphans + compile + refs + links + xrefs) | **< 5 s** @ 200 shards  | PR feedback under 10 s total         |
| Same                                               | **< 15 s** @ 500 shards | Large program still acceptable in CI |

### Tier 3 — Full CI (with peer linters)

| Operation                             | Target                  | Rationale                                    |
| ------------------------------------- | ----------------------- | -------------------------------------------- |
| `check --require-lint --require-vale` | **< 30 s** @ 200 shards | Peers are opt-in; budget separately          |
| Same                                  | **< 60 s** @ 500 shards | Upper bound before parallelization / caching |

### Tier 4 — Regression metrics (CI tracking)

Track and publish in CI ([performance-dogfood.csv](./performance-dogfood.csv), rows with `tier=4`):

| Metric                          | Target                              |
| ------------------------------- | ----------------------------------- |
| ms / shard (compile)            | Trend down; fail on >20% regression |
| ms / link (lint)                | Trend down                          |
| File reads / shard              | → 1                                 |
| Compile invocations per `check` | → 1                                 |

## Known bottlenecks

```text
mdcp check (after P1)
  orphans
  compileWorkspace ──► compileGuideResultsWithContext (once) → disk + refs + link lint
  xrefs
  markdownlint (shards + compiled)
  Vale
```

| Hot path                                     | Status                                                          |
| -------------------------------------------- | --------------------------------------------------------------- |
| `writeCompiled` + `runBuiltInLinkLint`       | **Fixed (P0)** — single compile per command                     |
| `validateCompiledLinkTarget`                 | **Fixed (P0)** — slug registries cached per output file         |
| `buildSlugRegistry`                          | **Fixed (P0)** — single line split                              |
| `lintShardLinks` → `shardSlugSet`            | **Fixed (P0)** — slug set computed once per shard               |
| `linkedSectionFiles` / `buildSectionSlugMap` | **Fixed (P1)** — compile-scoped shard cache; one read per shard |
| Peer linters                                 | Separate cost; scales with file count and rules                 |

## Optimization roadmap

P0+P1 shipped ([#64](https://github.com/betsalel-williamson/mdcp/issues/64)). P2+ deferred to [#67](https://github.com/betsalel-williamson/mdcp/issues/67) — dogfood meets SLOs at ~64 shards; revisit at 200-shard scale or if agent-loop latency becomes a blocker.

### P0 — Eliminate redundant work (expected 2–3× win) — **done**

- [x] Compile once per command; pass results through write, refs, and link lint
- [x] Cache slug registries per output file during link validation
- [x] Cache shard slug sets in `lintShardLinks`
- [x] Fix `buildSlugRegistry` double-split

**Acceptance:** `compileGuideResults` is invoked exactly once per `mdcp compile` and `mdcp check`; see CSV row `compile invocations per check` and `pnpm bench:dogfood` for measured improvements.

### P1 — Read amplification (expected ~2× compile win) — **done**

- [x] Single pass per shard: read once → `{ body, slugs, links, provenance }` via `ShardCache`
- [x] Memoize `buildGuideLinkIndex` / section slug maps across guides; reuse `linkIndex` in link lint

**Acceptance:** Tier 4 metric **file reads / shard → 1** during `compileGuideResultsWithContext`; verified by [`shard-cache.test.ts`](../../../packages/mdcp-core/test/shard-cache.test.ts). Dogfood `compileGuideResults (core)` ~60 ms after P1 (`pnpm bench:dogfood`).

### P2 — Agent path (deferred)

Deferred — dogfood meets SLOs; revisit at 200-shard scale or if agent-loop latency becomes a blocker ([#67](https://github.com/betsalel-williamson/mdcp/issues/67)).

- Optional `--guide` scope for compile/lint during authoring
- Keep `refs.json` / `refs list` cheap relative to full compile when agent loops grow

### P3 — Observability (deferred)

Deferred — no SLO miss at 64 shards; needed before scale investment ([#67](https://github.com/betsalel-williamson/mdcp/issues/67)).

- Benchmark harness with fixtures at 64 / 200 / 500 shards
- CI regression gate on Tier 4 metrics
- Optional `mdcp check --profile` for phase timings

### P4 — Peer linters (deferred)

Deferred — full check with peers ~1.2 s at dogfood, within Tier 3 ([#67](https://github.com/betsalel-williamson/mdcp/issues/67)).

- Document peer linter cost separately from core mdcp
- Parallel peer runs or incremental lint at scale

## Related

- [Usage model](./usage-model.md) — query preference order and actor obligations
- [Link validation](../link-validation.md) — built-in link lint specification
- [Vision and roadmap](./00-vision-and-roadmap.md) — phased delivery
