# Performance goals and review

Latency targets and scaling expectations for MDCP compile, validation, and agent query paths. Parent epic: [GitHub #64](https://github.com/betsalel-williamson/mdcp/issues/64).

MDCP is designed for **full programs** — hundreds of shards across multiple guides with dense cross-links — while keeping interactive agent loops and CI gates fast. This page records measured baselines, proposed SLOs, known bottlenecks, and the optimization roadmap.

## Why performance matters

| Actor                    | Hot path                             | Expectation                                                                        |
| ------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------- |
| LLM doc author           | `refs lookup` → edit shard → `check` | Sub-second feedback per lookup; compile+check under a few seconds during authoring |
| CI                       | `mdcp check --require-lint`          | PR gate completes before reviewer context switches                                 |
| Agent (context consumer) | `refs lookup`, single-shard read     | No full-repo compile on every query                                                |

The [usage model](./usage-model.md) prefers granular context (`refs lookup` → one shard). Performance work keeps that model viable as repos grow.

## Current baseline (dogfood `docs/` repo)

Measured on the reference repo (~64 shards, 4 guides, ~296 source links, ~357 compiled links):

| Operation                          | Shards | Time    | Notes                                            |
| ---------------------------------- | ------ | ------- | ------------------------------------------------ |
| `compileGuideResults` (core, once) | 64     | ~700 ms | Multi-guide, glossary scope, cross-guide rewrite |
| Built-in link lint                 | 64     | ~3.0 s  | Dominates core work                              |
| `mdcp compile` (CLI)               | 64     | ~4.9 s  | Compiles **3×** (write + string + link lint)     |
| `mdcp check` (CLI, with peers)     | 64     | ~6.6 s  | Core ~4 s + markdownlint + Vale on 71 files      |

Link validation cost scales with **links × target file size**, not shard count alone. On dogfood, compiled link lint averages ~8 ms/link because publish outputs re-read target files and rebuild slug registries per cross-file `#fragment` link.

## Scaling projections

Synthetic fixtures (single guide + glossary, simple intra-guide links):

| Shards | Links/shard | Core total (compile + lint) |
| ------ | ----------- | --------------------------- |
| 64     | 5           | ~74 ms                      |
| 100    | 5           | ~160 ms                     |
| 200    | 5           | ~543 ms                     |
| 500    | 5           | ~3.1 s                      |
| 200    | 20          | ~4.2 s                      |

Scaling is **superlinear** beyond ~200 shards — repeated file reads and link-graph walks dominate.

Real multi-guide repos with publish outputs (`compile.outputFile`), cross-guide rewriting, and compile hooks are roughly **10× slower per shard** than synthetic fixtures. Extrapolated full programs:

| Scale      | Core compile + lint | Full `check` (with peers) |
| ---------- | ------------------- | ------------------------- |
| 200 shards | ~5–15 s             | ~15–30 s                  |
| 500 shards | ~15–45 s            | ~45–90 s                  |

These extrapolations are pre-optimization. The SLOs below define where the toolchain should land.

## Service level objectives (SLOs)

### Tier 1 — Interactive (agent authoring loop)

| Operation                | Target                    | Rationale                                    |
| ------------------------ | ------------------------- | -------------------------------------------- |
| `refs lookup`            | **< 200 ms** @ 500 shards | Called many times per session                |
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

Track and publish in CI:

| Metric                          | Target                              |
| ------------------------------- | ----------------------------------- |
| ms / shard (compile)            | Trend down; fail on >20% regression |
| ms / link (lint)                | Trend down                          |
| File reads / shard              | → 1                                 |
| Compile invocations per `check` | → 1                                 |

## Known bottlenecks

```text
mdcp check (today)
  orphans
  writeCompiled ──► compileGuideResults #1 → disk → compileGuideResults #2
  refs gen/check
  link lint ──► compileGuideResults #3
  xrefs
  markdownlint (shards + compiled)
  Vale
```

| Hot path                                     | Issue                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `writeCompiled` + `runBuiltInLinkLint`       | Triple compile per `check` / `compile`                                           |
| `refs lookup`                                | Recompiles full monolith every call; should query persisted `refs.json`          |
| `validateCompiledLinkTarget`                 | Re-reads target `.md` and rebuilds slug registry per cross-file `#fragment` link |
| `buildSlugRegistry`                          | Splits compiled text twice per line                                              |
| `lintShardLinks` → `shardSlugSet`            | Re-parses entire shard for every `#anchor` link                                  |
| `linkedSectionFiles` / `buildSectionSlugMap` | Multiple full reads per shard during index build and assembly                    |
| Peer linters                                 | Separate cost; scales with file count and rules                                  |

## Optimization roadmap

Tracked in [GitHub #64](https://github.com/betsalel-williamson/mdcp/issues/64).

### P0 — Eliminate redundant work (expected 2–3× win)

- Compile once per command; pass results through write, refs, and link lint
- Cache slug registries per output file during link validation
- Cache shard slug sets in `lintShardLinks`
- Fix `buildSlugRegistry` double-split

### P1 — Read amplification (expected ~2× compile win)

- Single pass per shard: read once → `{ body, slugs, links, provenance }`
- Memoize `buildGuideLinkIndex` / section slug maps across guides

### P2 — Agent path

- Persist `refs.json`; make `refs lookup` query registry (no compile)
- Optional `--guide` scope for compile/lint during authoring

### P3 — Observability

- Benchmark harness with fixtures at 64 / 200 / 500 shards
- CI regression gate on Tier 4 metrics
- Optional `mdcp check --profile` for phase timings

### P4 — Peer linters (separate budget)

- Document peer linter cost separately from core mdcp
- Parallel peer runs or incremental lint at scale

## Related

- [Usage model](./usage-model.md) — query preference order and actor obligations
- [Link validation](../link-validation.md) — built-in link lint specification
- [Vision and roadmap](./00-vision-and-roadmap.md) — phased delivery
