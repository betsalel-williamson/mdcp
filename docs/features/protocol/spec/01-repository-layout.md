# Repository layout

Where shards live, what a guide is, and the default tier layout for software repositories.

## Docs root

Every operation resolves against a **docs root**: the directory that holds guide directories. The reference CLI takes it as `--docs-root` and defaults to the invocation directory. Guide paths, `scopeRoot`, and the output directory are all resolved relative to it.

The docs root **MUST NOT** be assumed to be the repository root. Published outputs regularly land outside it — this repository writes `DEVELOPERS.md` and package READMEs from shards under `docs/`.

## Shards

A **shard** is a single Markdown file holding one settled idea for one audience and one job. A shard **SHOULD** carry exactly one level-one heading as its first heading, and **MUST NOT** be a compiled output of another shard.

Shards are the source of truth. A conforming implementation **MUST NOT** treat compiled output as an input to a later compile, and an adopting repository **MUST NOT** hand-edit compiled files. Compiled files are identifiable by their `<!-- mdcp-shard: start … -->` markers, which name the source shard.

## Guides

A **guide** is a named, ordered collection of shards that compiles to one rendered document. A guide is named in `compileOrder` and resolves to a directory: `guides[].path` when set, otherwise `{docsRoot}/{name}`.

Each guide **MUST** have a manifest in its directory. Manifest discovery and ordering are specified in [Manifest](./02-manifest.md).

A guide directory **MAY** contain subdirectories. Shards in subdirectories are compiled when they are reachable through manifest links, directly or transitively.

## The code repository archetype

Conforming repositories **SHOULD** organize shards into the four tiers below. This layout is the batteries-included default for software projects; it is a **SHOULD** because the compile and validation mechanics do not depend on it.

| Guide tier | Typical path | Holds                                                                 | Keep out                                                  |
| ---------- | ------------ | --------------------------------------------------------------------- | --------------------------------------------------------- |
| Features   | `features/`  | Product capabilities, design records, contracts, acceptance criteria  | Maintainer runbooks, CI and eval loops, contributor setup |
| Client     | `client/`    | Consumer value and usage of the shipped tool                          | Internal contributor process, skill-authoring evals       |
| Developer  | `developer/` | Repository workflow, tracker integration, releases, skill development | Product capability specs or end-user tutorials            |
| Glossary   | `glossary/`  | Shared terms and disambiguation                                       | General code snippets                                     |

The tiers exist to keep boundaries from eroding as a corpus grows: contributor workflow stays out of consumer documentation, and high-level capability specs stay separate from repository mechanics.

### Placement test

If only contributors to the documentation repository need a shard, it belongs in `developer/`. If consumers of the product need it, it belongs in `features/` or `client/`.

## Glossary shards

Glossary terms **SHOULD** be one shard per entry. A large glossary **MAY** split its manifest across `index.md` and sub-index files such as `index-protocol.md` that link term shards; transitive manifest resolution pulls the terms into compile output either way.

## Other archetypes

The engine is layout-agnostic. Other domains — legal operations, human resources policy, hardware manuals — **MAY** define their own tiers and compile them with the same mechanics. Archetype packs are described in [Extensions and archetypes](../extensions-and-archetypes.md).
