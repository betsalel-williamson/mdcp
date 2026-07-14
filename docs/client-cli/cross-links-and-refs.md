# Cross-links and refs

When writing `` `[link text](#anchor)` `` in a shard, the fragment must match the [heading slug](../glossary/heading-slug.md) in **compiled** output. [Refs](../glossary/refs.md) are the system that keeps those [cross-links](../glossary/cross-link.md) organized and checkable after stitch — not a doc-search tool.

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
mdcp check --config docs/mdcp.config.json --docs-root docs
mdcp refs list
```

`mdcp check` fails on dead `#` fragments and bad paths. `mdcp refs list` shows registry entries from the [refs registry](../glossary/refs-registry.md).

The part after `#` must match how the compiled doc names that heading — which changes when shards are merged and headings shift level.

## Heading slugs (GitHub rules)

MDCP derives `#fragment` targets from **compiled** heading text using the same algorithm GitHub applies when rendering READMEs and issues. There is no separate GFM spec for auto-generated heading IDs; the de-facto reference is GitHub's [html-pipeline `TableOfContentsFilter`](https://github.com/gjtorikian/html-pipeline/blob/main/lib/html/pipeline/toc_filter.rb). `@bwilliamson/mdcp-core` implements that behavior through the [`github-slugger`](https://www.npmjs.com/package/github-slugger) package.

| Input                                      | Plain text used for slugging                | Example slug                            |
| ------------------------------------------ | ------------------------------------------- | --------------------------------------- |
| Heading `git status`                       | `git status` (inline markup stripped)       | `git-status`                            |
| `Preprocessor / templating (out of scope)` | Punctuation removed; each space becomes `-` | `preprocessor--templating-out-of-scope` |
| `` `--config` vs `--docs-root` ``          | Consecutive dashes preserved                | `--config-vs---docs-root`               |
| Two `## Foo` headings in one guide         | Second occurrence disambiguated             | `foo`, then `foo-1`                     |

**Authoring rules:**

1. **Prefer unique subheadings** — duplicate heading text in the same document produces `-1`, `-2` suffixes; the first `#slug` link may not reach later occurrences.
2. **Validate with `mdcp check`** — do not hand-roll anchors from shard-only titles and assume they survive compile.
3. **Explicit `{#id}` overrides** — when present on a heading line, that id is used instead of the auto slug (lowercased). Use sparingly; GitHub slugs are the default contract.

`githubSlugify` and `buildSlugRegistry` in `@bwilliamson/mdcp-core` share this algorithm for link validation, `refs.json`, and compile-time slug maps. See [API — Refs and validation](../client-core/api-refs-validation.md#heading-slugs-github-slugger).
