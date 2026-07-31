# ADR 0005: Keep linear TypeScript scanners over rg, Peggy, or Rust for markdown micro-parsers

- **Status:** Accepted
- **Date:** 2026-07-31
- **Related:** GitHub issues [#201](https://github.com/betsalel-williamson/mdcp/issues/201) (Phase B ReDoS audit), [#200](https://github.com/betsalel-williamson/mdcp/issues/200) (Phase A helpers), [#66](https://github.com/betsalel-williamson/mdcp/issues/66) (Rust engine lookout); [Safe markdown parsing](../../developer/safe-markdown-parsing.md); [Performance goals and review](../protocol/performance.md)

## Context

Phase A and Phase B replaced polynomial-risk regexes for ATX headings, Pandoc `{#id}` markers, chapter xref lint, and code-evidence line ranges with small **linear TypeScript scanners** under `mdcp-core`. That creates a growing set of purpose-built parsers rather than one regex-heavy surface.

While reviewing that work we asked whether those scanners should instead use:

1. **ripgrep (`rg`)** — external search over paths
2. **Peggy** (or similar PEG) — generated parsers from a grammar
3. **Rust** (napi-rs or wasm) — native or wasm hot path for compile/lint

The product already parks a **whole-engine** Rust spike behind P3 benchmarks and SLO misses ([#66](https://github.com/betsalel-williamson/mdcp/issues/66)). This ADR records the narrower decision for the **micro-parser** layer so future agents and humans can re-evaluate without re-deriving the trade-offs.

## Decision

We will **keep hand-written linear TypeScript scanners** for heading, anchor, chapter-ref, and line-range style helpers.

We will **not** adopt ripgrep, Peggy (or equivalent PEG generators), or a Rust/wasm engine **for these micro-parsers** as the next step after the ReDoS work.

| Option                         | Disposition for micro-parsers                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **TypeScript linear scanners** | **Chosen** — in-process, O(n), ReDoS-safe, easy parity with prior regex behavior                                                                                               |
| **ripgrep (`rg`)**             | **Declined** — filesystem search via process spawn; wrong layer for already-loaded strings that need structured rewrite results                                                |
| **Peggy / PEG**                | **Declined for now** — pays off for recursive shared grammars; overhead without benefit for flat left-to-right line walks                                                      |
| **Rust / wasm micro-helpers**  | **Declined for now** — bridge and packaging cost dominate unless whole-document compile is the unit of work (see [#66](https://github.com/betsalel-williamson/mdcp/issues/66)) |

## Consequences

- New heading / `{#id}` / chapter-ref / line-range logic prefers imperative scanners (or the shared `markdown/` helpers), not new polynomial-risk regexes and not a second parse stack.
- Standard markdown **link** extract/rewrite regexes may remain where Phase B dismissed them; that is separate from this ADR.
- Performance work stays aligned with [Performance goals and review](../protocol/performance.md): Node P3 path first; Rust is a **batched compile-engine** candidate, not a per-helper FFI story.
- ReDoS duration-budget tests remain the regression control for the scanner class.

## Re-evaluate when

Reopen or supersede this ADR when **any** of the following is true:

1. **Profiled need** — after P3 Node work and fixtures from [#66](https://github.com/betsalel-williamson/mdcp/issues/66), `--profile` (or equivalent) shows these scanners dominate assemble/check CPU on a real multi-guide corpus, and Node parallelism still misses Tier 1/2 SLOs.
2. **Unified grammar** — we intentionally adopt an authored-GFM **subset grammar** as product surface (Peggy or another generator becomes the single source of truth for many constructs, not only these four).
3. **Engine commitment** — production Rust/wasm compile engine ships per [#66](https://github.com/betsalel-williamson/mdcp/issues/66); micro-parsers move **with** that batched pipeline, not as standalone FFI calls per line.
4. **New ReDoS / correctness class** — CodeQL or adopters show a scanner family that hand walks cannot keep correct without a real grammar.

Until then, treat proposals to introduce `rg`, Peggy, or Rust solely to “speed up” the Phase A/B helpers as out of scope unless they meet a trigger above.
