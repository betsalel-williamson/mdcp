# Archetype: Product docs site (`arch-product-docs-site`)

For products that publish human-facing docs via **MkDocs, Docusaurus, VitePress**, or similar while keeping MDCP shards as the authoring source of truth.

## Layout

```text
docs/
  mdcp.v0.4.llms.txt
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

See [format/](../format/) for the formatting extension slot and naming (`format-docusaurus`, `format-mkdocs`, …). Product teams add `docs/extensions/docusaurus-mapping.md` (or similar) locally when proprietary theme rules apply.

## Agent workflow

1. Read fetched `mdcp.v*.llms.txt` — not edited per repo.
2. Load task prompt with `WORK_ITEM`.
3. Edit `client/` and `features/` shards.
4. `mdcp check` before PR; site CI runs after compile.

## Catalog id

`arch-product-docs-site` — doc-only archetype today; versioned fetchable packs **MAY** ship under `arch-product-docs-site/{version}/` later.
