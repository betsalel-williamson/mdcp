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
| Broadly applicable improvements                                                 | Propose upstream to `spec/llms-index/` via PR                                     |
| Project-specific guidance                                                       | `docs/extensions/` in your repo (local extension)                                 |
| Regenerate repo copy                                                            | `mdcp export --llms-index --fetch --fetch-profile alpha` after upstream alpha pin |

`mdcp export --llms-index` **without** `--fetch` may add a `## This repository` section — that is generated overlay, not a substitute for editing the canonical bootstrap in place.

## SOLID principles for MDCP

Design constraints for the protocol and its ecosystem — analogous to SOLID in software design, applied to **documentation context contracts**.

| Principle                 | MDCP meaning                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **S**ingle responsibility | llms-index = entrypoint and query instructions; shards = intent; code = implementation; extensions = vertical overlays  |
| **O**pen/closed           | Core protocol versioned and stable; extend through complementary skills without forking the base spec                   |
| **L**iskov substitution   | Optional extensions **MUST NOT** break core `mdcp check` when disabled; archetypes compose on top of conforming layouts |
| **I**nterface segregation | Export profiles (`--llm`, `--llms-index`), compile hooks, and archetype packs are separate opt-in surfaces              |
| **D**ependency inversion  | Agents and CI depend on **compiled contracts** and `refs lookup`, not ad-hoc README prose or host-specific rules        |

## Extensions directory

Published and community extensions live under [complementary skills](../../../spec/extensions/).

| Kind                | Purpose                                                        | Example                                         |
| ------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| **Archetype**       | End-to-end layout + conventions for a project class            | OSS library, product docs site                  |
| **Formatting pack** | Lint and style presets for a doc framework                     | Vale/Markdownlint for Docusaurus                |
| **Pointer profile** | Shards as stable links into source; agents read code on demand | API surface via `mdcp refs lookup` + file paths |

### Fork, use locally, or contribute back

- **Fork** complementary skills into your repo under `docs/extensions/` when you need proprietary or experimental packs.
- **Contribute back** via PR when an extension is broadly useful — we want shared archetypes to grow.
- **No obligation** — mdcp uses **MIT**; local-only proprietary extensions are explicitly encouraged when they encode competitive or regulated workflow detail.

V1 wires **extension packs** into `mdcp.config.json` — enable built-in packs (such as `prompts-mdcp-defaults`) or add custom packs with alternate `baseUrl` sources. List extension shards from your guide `index.md` like any other shard when the pack is doc-only.

```json
{
  "protocolVersion": "0.4.0.0",
  "protocol": {
    "fetch": { "ref": "v0.4.1", "profile": "dev" }
  },
  "extensions": {
    "packs": [
      { "id": "prompts-mdcp-defaults", "enabled": true, "version": "0.4.0.0" },
      {
        "id": "team-prompts",
        "enabled": true,
        "path": "prompts",
        "cacheDir": ".caches/mdcp/team-prompts",
        "files": ["feature.prompt.md"],
        "source": { "baseUrl": "https://cdn.example.com/my-org" }
      }
    ]
  }
}
```

**Bootstrap:** Phase 1 — `mdcp export --llms-index --fetch` without config (defaults). Phase 2 — add config with `protocol.profile` (and `protocol.ref` when not on `main`), re-fetch with `--config`.

**Security:** Default fetch uses the authoritative [`betsalel-williamson/mdcp`](https://github.com/betsalel-williamson/mdcp) repo. Per-pack `source` overrides and third-party URLs are a prompt-injection risk — see [spec/extensions/SECURITY.md](../../../spec/extensions/SECURITY.md). Future work: trusted-source allowlist and sandboxed fetch.

Built-in ids (such as `prompts-mdcp-defaults`) resolve paths under `spec/extensions/{id}/{version}/` from the root catalog ([FORMAT.md](../../../spec/extensions/FORMAT.md)). Each cache dir writes `manifest.json` with extension `version`, `protocolVersionRange`, upstream `ref`, and `files[]`. Revoked catalog entries **MUST NOT** be fetched.

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
- [Agent task prompts](./agent-task-prompts.md)
- [spec/extensions/README.md](../../../spec/extensions/README.md)
