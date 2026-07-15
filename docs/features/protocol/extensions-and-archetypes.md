# Extensions and archetypes

How MDCP stays **broadly applicable** while allowing **project-specific** (and proprietary) customization. Parent spec: [MDCP 1.0 (draft)](./mdcp-1.0-spec.md).

## Problem

A single monolithic agent index cannot serve every documentation culture — open-source libraries with Javadoc-style API surfaces, SaaS products with Docusaurus sites, regulated industries with fixed templates, or teams that want **pointer shards** into source files instead of duplicating implementation detail.

MDCP separates:

| Layer             | Holds                                                         | Edited by                                     |
| ----------------- | ------------------------------------------------------------- | --------------------------------------------- |
| **Protocol core** | Normative shards, schemas, CLI/core packages                  | Upstream mdcp maintainers; adopted by version |
| **Repo shards**   | `features/`, `client/`, `developer/`, `glossary/`             | Your team in git                              |
| **Extensions**    | Complementary skills, local overlays under `docs/extensions/` | Your team; **MAY** be proprietary             |

## Do not hand-edit agent entrypoints for repo-specific guidance

The parent **Agent Skill** (`skills/mdcp/` → `.agents/skills/mdcp/`) is the portable agent entrypoint. Legacy `mdcp.v*.llms.txt` files are deprecated.

| Rule                                                                       | Detail                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------- |
| Agents **MUST NOT** hand-edit vendored skill files for one-off repo advice | Changes belong in shards or `docs/extensions/`            |
| Broadly applicable improvements                                            | Propose upstream to `skills/mdcp/` via PR                 |
| Project-specific guidance                                                  | `docs/extensions/` or complementary skills you maintain   |
| Refresh local dogfood                                                      | `pnpm skill:install` (or `npx skills add . --skill mdcp`) |

## SOLID principles for MDCP

Design constraints for the protocol and its ecosystem — analogous to SOLID in software design, applied to **documentation context contracts**.

| Principle                 | MDCP meaning                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **S**ingle responsibility | Agent Skill = entrypoint and workflow; shards = intent; code = implementation; extensions = vertical overlays           |
| **O**pen/closed           | Core protocol versioned and stable; extend through complementary skills without forking the base skill                  |
| **L**iskov substitution   | Optional extensions **MUST NOT** break core `mdcp check` when disabled; archetypes compose on top of conforming layouts |
| **I**nterface segregation | Export profiles (`--llm`), compile hooks, and complementary skills are separate opt-in surfaces                         |
| **D**ependency inversion  | Agents and CI depend on **compiled contracts** and `mdcp check`, not ad-hoc README prose or host-specific rules         |

## Extensions directory

Published and community extensions live as complementary skills under `skills/mdcp-arch-*` (WIP) or local `docs/extensions/`.

| Kind                | Purpose                                                        | Example                                   |
| ------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| **Archetype**       | End-to-end layout + conventions for a project class            | OSS library, product docs site            |
| **Formatting pack** | Lint and style presets for a doc framework                     | Vale/Markdownlint for Docusaurus          |
| **Pointer profile** | Shards as stable links into source; agents read code on demand | API surface via heading refs + file paths |

### Fork, use locally, or contribute back

- **Fork** complementary skills into your repo under `docs/extensions/` when you need proprietary or experimental packs.
- **Contribute back** via PR when an extension is broadly useful — we want shared archetypes to grow.
- **No obligation** — mdcp uses **MIT**; local-only proprietary extensions are explicitly encouraged when they encode competitive or regulated workflow detail.

**Bootstrap:** Install the parent skill with `npx skills add betsalel-williamson/mdcp --skill mdcp`. Commit `.agents/skills/mdcp/` in consumer repos so agents share the same instructions.

**Security:** Agent Skills operate with identical permissions to the user. Treat third-party Agent Skills as untrusted. Future work: trusted-source allowlist and sandboxed execution.

Built-in subagents (such as the `mdcp` feature and doc-only subagents) resolve directly via the `.agents/skills/` directory. Each Agent Skill is an isolated, independent entity.

## Archetypes

An **archetype** is a documented bundle: guide layout, glossary seeds, optional prompts, and extension pointers for one project class.

| Archetype         | Extension id             | When to use                   | Shard emphasis                                              |
| ----------------- | ------------------------ | ----------------------------- | ----------------------------------------------------------- |
| OSS library       | `arch-oss-library`       | npm/crates publishable API    | Pointer shards to `src/`; minimal duplication of signatures |
| Product docs site | `arch-product-docs-site` | MkDocs, Docusaurus, VitePress | `format-*` extension + client guide tier                    |

Archetype READMEs live under complementary skills — for example `arch-oss-library/` and `arch-product-docs-site/`.

Formatting packs use the `format-*` prefix — see `spec/extensions/format/`.

Start from an archetype README, copy patterns into `docs/`, then customize under `docs/extensions/`.

## Governance vision

MDCP is designed to outgrow a single vendor implementation. The long-term goal is sponsorship under a **neutral foundation** (for example Linux Foundation or similar) so protocol artifacts, extension catalogs, and conformance vectors have a trusted home. Until then, the mdcp repository hosts the reference implementation and `spec/` tree.

## Related

- [Vision and roadmap](./00-vision-and-roadmap.md)
- [Agent task subagents](./agent-task-prompts.md)
- [spec/extensions/README.md](../../../spec/extensions/README.md)
