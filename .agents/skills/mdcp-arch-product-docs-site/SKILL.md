---
name: mdcp-arch-product-docs-site
description: >-
  Archetype skill for Product Docs Sites (MkDocs, Docusaurus, VitePress). Use
  this skill when the user is building, documenting, or architecting a human-facing
  documentation site where MDCP shards are the authoring source of truth.
  Triggers when users mention MkDocs, Docusaurus, VitePress, site generators,
  or publishing documentation to the web.
---

# MDCP Archetype: Product Docs Site

For products that publish human-facing docs via **MkDocs, Docusaurus, VitePress**, or similar while keeping MDCP shards as the authoring source of truth.

## Layout

```text
docs/
  extensions/
    publish-pipeline.md         # how compiled GFM feeds the site generator
  features/
  client/                         # end-user guide (also site nav source)
  developer/
site/                             # downstream publish (not MDCP source of truth)
```

## Two outputs, one shard tree

| Output       | Consumer                 | Generated                                      |
| ------------ | ------------------------ | ---------------------------------------------- |
| MDCP compile | Agents, CI, `mdcp check` | `guides.md`, package READMEs                   |
| Site build   | Human readers on the web | MkDocs/Docusaurus (downstream of compiled GFM) |

Shards stay GFM. A `format-*` extension documents heading rules, admonition mapping, and link policies for your chosen site generator.

## Formatting extensions

See `format-*` skills for the formatting extension slot and naming (e.g., `mdcp-format-docusaurus`, `mdcp-format-mkdocs`). Product teams add `docs/extensions/docusaurus-mapping.md` (or similar) locally when proprietary theme rules apply.

## Agent workflow

1. Read the parent `mdcp` skill.
2. Load task prompt with `WORK_ITEM` (via `mdcp` subagents).
3. Edit `client/` and `features/` shards.
4. Run `mdcp check` before PR; site CI runs after compile.
