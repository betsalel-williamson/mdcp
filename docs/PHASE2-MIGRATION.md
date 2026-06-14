# Phase 2 migration — legacy → @bwilliamson/mdcp-\*

Port map from `legacy/` bash/Python to TypeScript packages.

## Modules

| Legacy                        | `@bwilliamson/mdcp-core`                                       |
| ----------------------------- | -------------------------------------------------------------- |
| `compile_sections.py`         | `src/compile/`                                                 |
| `write-sections-manifest.py`  | `src/manifest/`                                                |
| `shard.sh` transforms         | `src/shard/` + config                                          |
| `generate-anchor-registry.py` | **Replaced** by `src/refs/slugs.ts` (GitHub slugs, no `{#id}`) |
| `lint-xrefs.py`               | `src/xrefs/`                                                   |
| `validate.sh`                 | `mdcp check`                                                   |

## Consumer migration

1. Add `mdcp.config.json` to your docs shard directory
2. Replace local compile scripts with `npx @bwilliamson/mdcp-cli compile`
3. Replace validate scripts with `npx @bwilliamson/mdcp-cli check --require-lint`
4. Use `mdcp refs lookup` for cross-link slugs (no `{#heading-ids}`)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

## md-tree fork criteria

Document in `docs/design.md` when:

- `assemble` needs heading-transform hooks
- `explode` needs preamble without synthetic H2
- Upstream unresponsive

Until fork: depend on md-tree for **split only**; never upstream `assemble`.
