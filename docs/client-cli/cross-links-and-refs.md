# Cross-links and refs

When writing `` `[link text](#anchor)` `` in a shard, the anchor must match the compiled heading slug. Look it up instead of guessing:

```bash
mdcp refs lookup "getting started" --format json
mdcp refs list
```

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

1. **Look up slugs** — run `mdcp refs lookup` or `mdcp refs list` after compile; do not hand-roll anchors from heading titles.
2. **Prefer unique subheadings** — duplicate heading text in the same document produces `-1`, `-2` suffixes; the first `#slug` link may not reach later occurrences.
3. **Explicit `{#id}` overrides** — when present on a heading line, that id is used instead of the auto slug (lowercased). Use sparingly; GitHub slugs are the default contract.

`githubSlugify` and `buildSlugRegistry` in `@bwilliamson/mdcp-core` share this algorithm for link validation, `refs.json`, and compile-time slug maps. See [API — Refs and validation](../client-core/api-refs-validation.md#heading-slugs-github-slugger).
