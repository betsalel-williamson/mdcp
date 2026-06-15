# Design constraints

## md-tree integration

MDCP uses `@kayvan/markdown-tree-parser` for **split only** (`extract-all`, `explode`).

Upstream `assemble` is **not used** — it does not support:

- Per-section heading demotion (shard `#` → compiled `##`)
- Synthetic `about-this-guide` preamble stripping
- Overview coverage second-H1 exception

## Fork criteria

Vendor fork into `packages/markdown-tree` when:

1. `assemble` needs heading-transform hooks
2. `explode` must preserve preamble without synthetic H2 promotion
3. Upstream is unresponsive or breaking

Until fork: depend on md-tree for **split only**; never upstream `assemble`.

## Heading references

No `{#heading-ids}`. Slugs use GitHub algorithm on **compiled** output.

## Peer linters

markdownlint-cli2, Vale, Prettier, markdown-link-check are **not bundled**.

Detection order: `node_modules/.bin` → PATH → skip with info.

Use `--require-lint` / `--require-vale` in CI.

## GFM scope

[GFM](../glossary/index.md#gfm) only. No Pandoc, LaTeX, wikilinks.

## Preprocessor / templating (out of scope)

MDCP does not run **preprocessor** or **templating** steps on shard source — no variable substitution, conditional blocks, parameterized partial includes, or other macro-style transforms before or after compile.

Those concerns belong in a separate tool or pipeline stage in the consumer repo:

```text
preprocess (optional) → mdcp compile / check → postprocess (optional)
```

Run preprocessing **before** shards are authored or committed (or regenerate shards from templates in CI). Run postprocessing **after** MDCP produces compiled output when you need transforms on the assembled artifact.

**Out of scope examples:**

- `{{variable}}` / `{{ env.VAR }}` substitution in shard bodies
- Template engines (Handlebars, Nunjucks, Jinja-style `{% if %}` blocks)
- Parameterized partial includes beyond MDCP's captioned insert inlining ([`inlineInserts`](../client-core/compile-hooks/inline-inserts.md))
- Build-time code generation that mutates shard markdown prior to `mdcp compile`

**Not compile hooks:** [`guides[].compile.hooks`](../client-core/compile-hooks/index.md) assemble [authored GFM](../glossary/index.md#gfm) — link rewrites, insert inlining, and similar — not a template engine.

**Non-goals:** no built-in variable engine, template parser, or preprocessor hook API in MDCP core.
