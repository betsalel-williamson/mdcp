# Safe markdown parsing (heading and anchor helpers)

Maintainer note for why `mdcp-core` centralizes ATX heading and Pandoc-style `{#id}` handling in shared helpers instead of ad-hoc regular expressions, and how remaining package regexes were audited for [ReDoS](../glossary/redos.md) risk.

Work is tracked under [#200](https://github.com/betsalel-williamson/mdcp/issues/200) (Phase A, v0.7 release gate) and [#201](https://github.com/betsalel-williamson/mdcp/issues/201) (Phase B follow-up audit), as children of epic [#173 — Repository security posture](https://github.com/betsalel-williamson/mdcp/issues/173). CodeQL setup that surfaces these findings is [#174](https://github.com/betsalel-williamson/mdcp/issues/174).

## Why this is necessary

GitHub CodeQL’s `js/polynomial-redos` rule flagged several `mdcp-core` paths that parse headings and strip `{#id}` markers. The patterns used overlapping or unbounded quantifiers (`\s*` next to `{#…}`, `\s+` with a greedy remainder, non-greedy `.*?` between braces) on library-controlled strings. On adversarial input those matches can take time that grows badly with length — a [ReDoS](../glossary/redos.md) class of denial-of-service risk.

Even when everyday docs never hit the pathological case, the open alerts block a clean security dashboard, and the same regex shapes were copied across compile, refs, links, and xref lint. Fixing call sites one-by-one without a shared parse path invites the class to return.

## What we do instead (Phase A)

Phase A introduces shared **linear** helpers for:

- recognizing and demoting ATX headings
- stripping Pandoc-style `{#id}` markers (including optional preceding whitespace when cleaning compiled output)
- producing plain heading text for [heading slug](../glossary/heading-slug.md) generation

Public package APIs keep their existing names; call sites delegate to the helpers. Duration-budget regression tests exercise the known CodeQL pump classes so a future regex reintroduction fails CI.

See [Packages and tests](./packages-and-tests.md) for where the helper module lives under `mdcp-core`.

## Phase B inventory (remaining regexes)

Phase B inventories every remaining regex in `packages/mdcp-core/src/` after Phase A. Decision rule: **keep** when the shape is clearly linear (anchored literals, single character-class stars without overlapping suffixes, fixed alternations); **rewrite** when the shape is polynomial-adjacent (`\s*` / overlapping optional groups next to digits, or the same class CodeQL already flagged); **dismiss** when a conservative static checker flags a standard markdown-link idiom that stays empirically linear and rewriting would churn call sites without clearing a known alert class.

Duration-budget tests cover rewritten paths. Link extract/rewrite patterns stay as regexes with the dismissals below — not a full parser purge. Alternatives such as ripgrep, Peggy, or Rust for these scanners are declined for now; see [ADR 0005](../features/adr/0005-keep-ts-scanners-over-rg-peggy-rust.md).

### Rewritten (linear scanners)

| Location                         | Former risk shape                                    | Disposition                                        |
| -------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| `xrefs/lint.ts` chapter refs     | `\s*` plus optional dash-title with a stop-set class | Imperative `Ch.` / `Chapter` scanner               |
| `xrefs/lint.ts` unlinked `see`   | `\s*` after lookbehind                               | Imperative scan after `(` / `,`                    |
| `compile/hooks/code-evidence.ts` | `LINE_RANGE_RE` optional `L`/`lines?` + `\s*` + alts | Imperative `lineRangeFromText`                     |
| `compile/headings.ts` About H1   | `^#\s+About…\s*$` (safe but heading-regex sprawl)    | `parseAtxHeading` + case-insensitive title compare |

### Kept (clearly linear)

| Location                         | Pattern role                   | Rationale                                       |
| -------------------------------- | ------------------------------ | ----------------------------------------------- |
| `compile/headings.ts` `FENCE_RE` | Fence open/close markers       | Anchored; `` `{3,}` `` / `~{3,}` then remainder |
| `refs/slugs.ts` `CHAPTER_KEY_RE` | `XX Chapter N` keys            | Anchored; fixed letters + spaces + digits       |
| `refs/slugs.ts` slug cleanup     | `[^a-z0-9]+`, trim dashes      | Single character-class replace                  |
| `export/protocol-version.ts`     | `mdcp.v…llms.txt` filenames    | Anchored filename; `[\d.]+` is linear           |
| `compile/section-slug.ts`        | `FIND-N.md`, `.md` suffix      | Anchored / suffix only                          |
| `compile/section-manifest.ts`    | Dynamic `##` sections heading  | Escaped literal; anchored `^##\s+…\s*$`         |
| `links/validate.ts`              | `https?://`, `.md` suffix      | Anchored / suffix                               |
| `compile/assemble.ts`            | Collapse `\n{3,}`              | Bounded quantifier on one character             |
| `shard/orchestrator.ts`          | Demote leading H1 marker       | Fixed two-character `#` + space prefix          |
| Misc adornment / path trims      | Bold stars, inline ticks, `./` | Literal or single-class                         |

### Dismissed (link idioms — keep regex)

| Location                                        | Pattern role                      | Rationale                                                                                       |
| ----------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `links/extract.ts` `MD_LINK_RE`                 | Non-image `[label](target)`       | Standard GFM link extract; character-class stars; line-scoped; empirically linear at 40k+ chars |
| `xrefs/lint.ts` / `code-evidence.ts` link strip | `[…](…)` strip/match              | Same class as above; simpler `[^)]*` form already passes conservative checkers                  |
| `compile/section-manifest.ts` file/slug links   | Manifest `.md` / `#slug` links    | Same link idiom; used on small manifests                                                        |
| `compile/publish-links.ts` rewrite REs          | Intra/cross-guide / publish paths | Nested lookarounds + `.md` suffix; conservative checkers may flag; V8 timings stay linear       |
| `compile/hooks/inline-inserts.ts`               | Insert-library link match         | Same as publish-links; library-dir alternation is fixed                                         |

These dismissals are intentional: Phase B does **not** replace every regex with parsers. If CodeQL later opens `js/polynomial-redos` on a dismissed site, treat that alert as a new fix ticket (same TDD pattern as Phase A).

## Authoring implications

- Prefer the shared helpers for new heading or `{#id}` logic; do not add new polynomial-risk regexes for those jobs.
- Prefer imperative scanners when adding chapter-ref or line-range style matchers (optional whitespace next to digits or overlapping alternatives).
- Explicit `{#id}` markers in shards remain supported; stripping and slug behavior stay aligned with prior golden tests for normal content.
- After merge to the default branch, confirm CodeQL alerts for the heading/anchor class stay closed on the next scan of `main`.
