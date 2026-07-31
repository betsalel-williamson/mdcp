# Safe markdown parsing (heading helpers)

Maintainer note for why `mdcp-core` centralizes ATX heading parsing and related cleanup in shared **language-agnostic** GFM helpers instead of ad-hoc regular expressions.

Work is tracked under [#200](https://github.com/betsalel-williamson/mdcp/issues/200) (Phase A, v0.7 release gate) and [#201](https://github.com/betsalel-williamson/mdcp/issues/201) (Phase B follow-up audit), as children of epic [#173 — Repository security posture](https://github.com/betsalel-williamson/mdcp/issues/173). CodeQL setup that surfaces these findings is [#174](https://github.com/betsalel-williamson/mdcp/issues/174).

## Why this is necessary

GitHub CodeQL’s `js/polynomial-redos` rule flagged several `mdcp-core` paths that parse headings and strip leftover `{#…}` markers. The patterns used overlapping or unbounded quantifiers (`\s*` next to `{#…}`, `\s+` with a greedy remainder, non-greedy `.*?` between braces) on library-controlled strings. On adversarial input those matches can take time that grows badly with length — a [ReDoS](../glossary/redos.md) class of denial-of-service risk.

Even when everyday docs never hit the pathological case, the open alerts block a clean security dashboard, and the same regex shapes were copied across compile, refs, and links. Fixing call sites one-by-one without a shared parse path invites the class to return.

## What we do instead (Phase A)

Phase A introduces shared **linear** helpers for:

- recognizing and demoting ATX headings
- stripping leftover `{#…}` markers when cleaning compiled output (defensive cleanup — authoring opinion to avoid those markers is Vale `MDCP-Xref`)
- producing plain heading text for language-agnostic [heading slug](../glossary/heading-slug.md) generation

Public package APIs keep their existing names; call sites delegate to the helpers. Duration-budget regression tests exercise the known CodeQL pump classes so a future regex reintroduction fails CI.

See [Packages and tests](./packages-and-tests.md) for where the helper module lives under `mdcp-core`.

## What Phase B covers

Phase B is a broader inventory of remaining regexes in `mdcp-core` (for example code-evidence patterns). Those stay out of the Phase A release gate. Rewrite or keep case-by-case; do not block shipping Phase A on a full regex purge.

## Authoring implications

- Prefer the shared helpers for new heading or slug logic; do not add new polynomial-risk regexes for those jobs.
- Prefer GFM auto-slugs; do not author Pandoc `{#…}` on headings (Vale warns in this repo). Compile stripping stays available for legacy content.
- After merge to the default branch, confirm CodeQL alerts for this class close on the next scan of `main`.
