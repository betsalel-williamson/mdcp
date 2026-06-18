# MDCP extensions

Optional packs that extend the **protocol core** without forking it. The core stays small and versioned; extensions let industries and project types adopt helpful documentation standards.

## What belongs here vs in the protocol core

| Location                           | Content                                        | Changed by                            |
| ---------------------------------- | ---------------------------------------------- | ------------------------------------- |
| `spec/llms-index/`                 | Versioned agent bootstrap (`mdcp.v*.llms.txt`) | Maintainers; immutable after adoption |
| `spec/schemas/`                    | JSON Schema for artifacts                      | Maintainers                           |
| `spec/conformance/`                | Test vectors                                   | Maintainers                           |
| **`spec/extensions/`**             | Archetypes, formatting packs, pointer profiles | Community + maintainers               |
| `docs/extensions/` (consumer repo) | Local or proprietary overlays                  | Your team                             |

**Agents must not edit fetched `mdcp.v*.llms.txt` in a consumer docs root.** Put repo-specific agent guidance in `docs/extensions/` or normative shards.

## Extension kinds

```
spec/extensions/
  README.md                 # this file
  archetypes/               # project-class starter patterns
  formatting/               # lint/style packs per doc framework (stubs)
```

| Kind            | Directory           | Purpose                                                                       |
| --------------- | ------------------- | ----------------------------------------------------------------------------- |
| Archetype       | `archetypes/`       | Guide layout, glossary seeds, workflow for a project class                    |
| Formatting      | `formatting/`       | Markdownlint/Vale presets aligned to a publish stack                          |
| Pointer profile | (within archetypes) | Shards link to source files; agents read code instead of duplicating API text |

## Use an extension

1. Read the archetype or pack README.
2. Copy patterns into your repo (`docs/features/`, `docs/client/`, etc.).
3. Add local-only files under `docs/extensions/` when needed.
4. Link extension shards from your guide `index.md` manifests.

## Publish an extension

1. Fork the mdcp repository.
2. Add or extend under `spec/extensions/` with a README explaining scope, conformance expectations, and example `mdcp.config.json` snippets when relevant.
3. Open a PR — broadly useful packs merge here; niche packs can stay as linked examples in the PR description.

## Proprietary local extensions

You **do not** have to contribute extensions back. MIT-licensed mdcp imposes no copyleft on your `docs/extensions/` tree. We encourage sharing archetypes that help whole industries (healthcare compliance templates, game-engine doc layouts, etc.), but proprietary packs are a first-class use case.

## SOLID alignment

Extensions follow the [protocol SOLID principles](../../docs/features/protocol/extensions-and-archetypes.md#solid-principles-for-mdcp): optional, composable, and must not break core `mdcp check` when unused.

## Status

V1 ships the **directory and archetype stubs**. Automated `extensions` config in `mdcp.config.json` and MCP discovery of extension packs are future work (V2+).
