# Legacy migration

Port map from `legacy/` bash/Python to TypeScript packages.

## Modules

| Legacy                                       | `@bwilliamson/mdcp-core`                       |
| -------------------------------------------- | ---------------------------------------------- |
| `compile_sections.py`                        | `src/compile/`                                 |
| `write-sections-manifest.py`                 | `src/manifest/`                                |
| `shard.sh` transforms                        | `src/shard/` + config                          |
| `legacy/scripts/generate-anchor-registry.py` | Replaced by `src/refs/slugs.ts` (GitHub slugs) |
| `legacy/scripts/lint-xrefs.py`               | `src/xrefs/`                                   |
| `validate.sh`                                | `mdcp check`                                   |

## Consumer migration

1. Add `mdcp.config.json` to your docs shard directory
2. Replace local compile scripts with `npx @bwilliamson/mdcp-cli compile`
3. Replace validate scripts with `npx @bwilliamson/mdcp-cli check --require-lint`
4. Use `mdcp refs lookup` for cross-link slugs (no `{#heading-ids}`)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

This repository dogfoods the pattern under `docs/` — see [examples/sample-guides](../../examples/sample-guides/) for a minimal fixture.

## Config path bases (monolith vs per-guide output)

Three path bases appear in every config. Mixing them up is the most common migration bug after switching from hand-rolled compile scripts.

| Field                             | Base                                                      | Notes                                                                           |
| --------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `outputDir`                       | `--cwd`                                                   | Compile output root; default guide shard dirs live here too                     |
| `outputFile`, `refs.registryFile` | `outputDir`                                               | Monolith and refs registry — not `--cwd`                                        |
| `compile.outputFile`              | `outputDir` when the value has no `..`; otherwise `--cwd` | Publish targets outside the docs tree use `..` (for example `../DEVELOPERS.md`) |

**Nested `outputDir`:** use outputDir-relative monolith names (`"guides.md"`, `"refs.json"`). Per-guide outputs can use a bare filename (`"glossary.md"`) — MDCP writes `docs/_build/compiled/glossary.md`, not `docs/glossary.md`. Explicit cwd paths like `"_build/compiled/glossary.md"` still work and normalize to the same location.

Full tables and examples: [Config essentials — path bases](../client-cli/config-essentials.md#config-path-bases).

## md-tree fork criteria

Document in [Design constraints](./design-constraints.md) when:

- `assemble` needs heading-transform hooks
- `explode` needs preamble without synthetic H2
- Upstream unresponsive
