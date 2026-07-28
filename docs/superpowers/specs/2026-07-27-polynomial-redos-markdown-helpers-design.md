# Polynomial ReDoS → shared markdown helpers

**Date:** 2026-07-27  
**Status:** Approved for planning  
**Issues:** [#200](https://github.com/betsalel-williamson/mdcp/issues/200) (Phase A, v0.7 gate), [#201](https://github.com/betsalel-williamson/mdcp/issues/201) (Phase B follow-up)  
**Parent epic:** [#173](https://github.com/betsalel-williamson/mdcp/issues/173)  
**Related:** CodeQL/Zizmor setup [#174](https://github.com/betsalel-williamson/mdcp/issues/174)  
**CodeQL dashboard:** https://github.com/betsalel-williamson/mdcp/security/code-scanning

## Problem

GitHub CodeQL reports six open `js/polynomial-redos` warnings in `mdcp-core`. All are the same class: overlapping / unbounded quantifiers on library-controlled strings (ATX headings and Pandoc `{#id}` markers).

| Alert | Path | Unsafe pattern class |
| --- | --- | --- |
| #1 | `compile/anchors.ts` | `\s*` adjacent to `{#…}` |
| #2–#3 | `compile/headings.ts` | `HEADING_RE` with `\s+` + `.*` |
| #4, #6 | `refs/slugs.ts` | `\{#.*?\}` |
| #5 | `refs/slugs.ts` | heading `\s+` |

The same anti-patterns are duplicated in nearby call sites (`compile-title.ts`, `shard-cache.ts`, `validate-shards.ts`, heading skips in `xrefs/lint.ts`) even when CodeQL has not yet traced them as library input.

## Goals

1. Clear alerts #1–#6 before the next release (milestone **v0.7**).
2. Reduce heading/anchor regex sprawl via shared imperative helpers.
3. Prove the risk with a TDD red demo, then go green and keep the regression tests.
4. Audit remaining regexes in a non-blocking Phase B.

## Non-goals

- Changing Pandoc/GitHub heading or slug semantics beyond parity.
- Replacing every regex in the package with parsers.
- Dismissing CodeQL alerts without code changes.
- ESLint ban on regex (optional Phase B stretch only).

## Approach (phased)

### Phase A — shared helpers + clear alerts (release gate)

**Module:** `packages/mdcp-core/src/markdown/`

| Helper | Responsibility |
| --- | --- |
| `parseAtxHeading(line)` | Imperative ATX parse → `{ level, marker, whitespace, title }` or `null` |
| `isAtxHeading(line)` | Boolean wrapper |
| `stripPandocAnchors(text)` | Remove `{#id}` (and preceding whitespace when stripping from compiled markdown) without `\s*` / `.*?` backtracking |
| `headingTitlePlain(text)` | Strip anchors + light adornments for slugger input (parity with `headingTextToPlain`) |

**Migrate** (delete local copies of the unsafe patterns):

- `compile/anchors.ts`, `compile/headings.ts`, `refs/slugs.ts`
- `compile/compile-title.ts`, `compile/shard-cache.ts`, `links/validate-shards.ts`
- Heading-line skips in `xrefs/lint.ts`

**Public API:** keep existing exports (`stripExplicitAnchorMarkers`, `headingTextToPlain`, …) as stable wrappers.

#### TDD sequence

1. **Red:** adversarial / duration-budget tests against current regex paths (long space runs; `{{#` / nested `{#` pumps). Tests fail or exceed a tight deadline on today’s code.
2. **Green:** implement helpers, migrate call sites, same inputs finish within budget; existing golden tests stay green.
3. **Keep** the demo tests permanently so the class cannot regress silently.

### Phase B — broader audit (after A)

Inventory remaining regexes (`xrefs/lint.ts`, `code-evidence.ts`, `section-manifest.ts`, URL/path/filename checks, link rewrite patterns). Case-by-case: keep if clearly linear; rewrite or helper-ize if polynomial-adjacent. Same TDD pattern when a concrete risk is found.

## Testing & verification

- New unit tests under `packages/mdcp-core/test/` for helpers + ReDoS budgets.
- Existing suites: `anchors`, `headings`, `refs`, compile/link tests that touch titles/slugs.
- After merge to default branch: confirm CodeQL alerts #1–#6 close.
- Changeset for the security/hygiene fix on the next release.

## Success criteria (next ship)

- Phase A merged; adversarial tests green; CodeQL #1–#6 resolved.
- Phase B issue open, linked under #173 and to #200, not blocking the release.
