# Feature catalog

Command and capability reference. For the end-to-end mental model (shards, monolith vs publish outputs, validation pipeline, code map), read [Overview](./overview.md) first.

## Compile (P0.1)

Stitch shard directories into canonical monoliths or publish outputs. Demotes headings, strips `about-this-guide` preamble, optional per-guide titles and publish paths.

```bash
mdcp compile --config mdcp.config.json --cwd .
```

Guides with `compile.outputFile` write to a separate path (for example npm READMEs) and are excluded from the monolith.

## Refs + lookup (P0.2)

GitHub slugs from compiled output. Agents query headings while writing links.

```bash
mdcp refs lookup "authentication" --format json
```

## LLM export (P0.3)

Token-stripped context for agents.

```bash
mdcp export --llm --stdout --config mdcp.config.json
```

## Check gate (P0.4)

Structural validation: orphans → compile → refs → xrefs; peer linters optional.

```bash
mdcp check --require-lint
```

## Manifest link order (P1.1)

Compile order is derived from each guide's `index.md` or `shards.md` link order. When a manifest has policy prose with example links before an ordered section list, use `compile.sectionsHeading` — see [Manifest compile order](./manifest-compile-order.md).

## Shard split (P1.2)

Split monolith into shards via md-tree.

```bash
mdcp shard   # requires config.source
```

## Orphan check (P1.3)

Detect shards not in manifest or missing files.

## Xref lint (P1.4)

Fail on bare `Ch. N` and unlinked chapter-style references.

## Peer linters (P2.1)

Orchestrate markdownlint-cli2, Vale, Prettier, markdown-link-check from host repo.

## Compile hooks (P2.2)

Per-shard transforms via `guides[].compile.hooks`. Built-in hooks:

- **`stripAnchors`** — removes `{#anchor}` markers (also default via `compile.stripAnchors`)
- **`codeEvidence`** — rewrites repo source links to `#L` line fragments (symbol or line range in link text); rebases paths for the rendered output automatically. See [Compile hooks](../client-core/compile-hooks.md#codeevidence).
- **`inlineInserts`** — inlines captioned insert shards from shared libraries (`diagrams/`, `tables/`, `figures/`, `media/`); shard bodies may include tables, prose, or media (images, video, audio); numbered `####` headings per kind (`Table 1. …`); first mention per guide inlines, later references back-link. Optional `hooksConfig.inlineInserts.searchRoots`. See [Compile hooks](../client-core/compile-hooks.md#inlineinserts).
- **`reviewLinks`** — optional override for cross-guide link targets (`hooksConfig.reviewLinks.targetMonolith`); see [Compile hooks](../client-core/compile-hooks.md#reviewlinks)

**Link rewriting at assembly time:** every compile builds a cross-guide link index from `compileOrder`, rewrites inter-guide `.md` links per shard, then rewrites same-guide `./section.md` links to in-document `#anchor` links. When `compile.publishPathRewrite` is set (repo dogfood: `developer` → `DEVELOPERS.md`), shard-relative `../` and `../../` paths are rewritten for publish targets.

## Agent integration (consumer repo)

```json
{
  "scripts": {
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json",
    "docs:refs": "mdcp refs lookup",
    "docs:check:mdcp": "mdcp check --config docs/mdcp.config.json --require-lint"
  }
}
```

## Design constraints (summary)

- GFM only — no Pandoc, no required `{#heading-ids}`
- md-tree for split only — custom compile
- Peer linters opt-in — `--require-lint` / `--require-vale` in CI

Details in [Design constraints](./design-constraints.md) and [Legacy migration](./legacy-migration.md).
