# MDCP design notes

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

## Heading references

No `{#heading-ids}`. Slugs use GitHub algorithm on **compiled** output.

## Peer linters

markdownlint-cli2, Vale, Prettier, markdown-link-check are **not bundled**.

Detection order: `node_modules/.bin` → PATH → skip with info.

Use `--require-lint` / `--require-vale` in CI.

## GFM scope

Standard Markdown / GitHub Flavored Markdown only. No Pandoc, LaTeX, wikilinks.
