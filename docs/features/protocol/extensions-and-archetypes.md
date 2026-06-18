# Extensions and archetypes

How MDCP stays **broadly applicable** while allowing **project-specific** (and proprietary) customization. Parent spec: [MDCP 1.0 (draft)](./mdcp-1.0-spec.md).

## Problem

A single monolithic agent index cannot serve every documentation culture — open-source libraries with Javadoc-style API surfaces, SaaS products with Docusaurus sites, regulated industries with fixed templates, or teams that want **pointer shards** into source files instead of duplicating implementation detail.

MDCP separates:

| Layer             | Holds                                                        | Edited by                                     |
| ----------------- | ------------------------------------------------------------ | --------------------------------------------- |
| **Protocol core** | `spec/llms-index/`, normative spec, schemas, conformance     | Upstream mdcp maintainers; adopted by version |
| **Repo shards**   | `features/`, `client/`, `developer/`, `glossary/`, `review/` | Your team in git                              |
| **Extensions**    | Archetypes, formatting packs, local overlays                 | Your team; **MAY** be proprietary             |

## Do not edit `mdcp.v*.llms.txt` locally

The versioned llms-index in your **docs root** is a **fetched or generated protocol artifact**, not a scratchpad.

| Rule                                                                            | Detail                                                                            |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Agents **MUST NOT** hand-edit `mdcp.v*.llms.txt` for repo-specific improvements | Changes belong in shards or extensions                                            |
| Broadly applicable improvements                                                 | Propose upstream to [spec/llms-index/](../../../spec/llms-index/) via PR          |
| Project-specific guidance                                                       | `docs/extensions/` in your repo (local extension)                                 |
| Regenerate repo copy                                                            | `mdcp export --llms-index --fetch --fetch-profile alpha` after upstream alpha pin |

`mdcp export --llms-index` **without** `--fetch` may add a `## This repository` section — that is generated overlay, not a substitute for editing the canonical bootstrap in place.

## SOLID principles for MDCP

Design constraints for the protocol and its ecosystem — analogous to SOLID in software design, applied to **documentation context contracts**.

| Principle                 | MDCP meaning                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **S**ingle responsibility | llms-index = entrypoint and query instructions; shards = intent; code = implementation; extensions = vertical overlays         |
| **O**pen/closed           | Core protocol versioned and stable; extend through [spec/extensions/](../../../spec/extensions/) without forking the base spec |
| **L**iskov substitution   | Optional extensions **MUST NOT** break core `mdcp check` when disabled; archetypes compose on top of conforming layouts        |
| **I**nterface segregation | Export profiles (`--llm`, `--llms-index`), compile hooks, and archetype packs are separate opt-in surfaces                     |
| **D**ependency inversion  | Agents and CI depend on **compiled contracts** and `refs lookup`, not ad-hoc README prose or host-specific rules               |

## Extensions directory

Published and community extensions live under [`spec/extensions/`](../../../spec/extensions/).

| Kind                | Purpose                                                        | Example                                         |
| ------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| **Archetype**       | End-to-end layout + conventions for a project class            | OSS library, product docs site                  |
| **Formatting pack** | Lint and style presets for a doc framework                     | Vale/Markdownlint for Docusaurus                |
| **Pointer profile** | Shards as stable links into source; agents read code on demand | API surface via `mdcp refs lookup` + file paths |

### Fork, use locally, or contribute back

- **Fork** `spec/extensions/` into your repo under `docs/extensions/` when you need proprietary or experimental packs.
- **Contribute back** via PR when an extension is broadly useful — we want shared archetypes to grow.
- **No obligation** — mdcp uses **MIT**; local-only proprietary extensions are explicitly encouraged when they encode competitive or regulated workflow detail.

V1 does not yet wire extensions into `mdcp.config.json`; list extension shards from your guide `index.md` like any other shard. Config hooks are planned as the extension catalog matures.

## Archetypes

An **archetype** is a documented bundle: guide layout, glossary seeds, optional prompts, and extension pointers for one project class.

| Archetype                                                                   | When to use                   | Shard emphasis                                              |
| --------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------- |
| [OSS library](../../../spec/extensions/archetypes/oss-library/)             | npm/crates publishable API    | Pointer shards to `src/`; minimal duplication of signatures |
| [Product docs site](../../../spec/extensions/archetypes/product-docs-site/) | MkDocs, Docusaurus, VitePress | Formatting extension + client guide tier                    |

Start from an archetype README, copy patterns into `docs/`, then customize under `docs/extensions/`.

## Governance vision

MDCP is designed to outgrow a single vendor implementation. The long-term goal is sponsorship under a **neutral foundation** (for example Linux Foundation or similar) so protocol artifacts, extension catalogs, and conformance vectors have a trusted home. Until then, the mdcp repository hosts the reference implementation and `spec/` tree.

## Related

- [Vision and roadmap](./00-vision-and-roadmap.md)
- [llms-index export](../llms-index-export.md)
- [Agent task prompts](./agent-task-prompts.md)
- [spec/extensions/README.md](../../../spec/extensions/README.md)
