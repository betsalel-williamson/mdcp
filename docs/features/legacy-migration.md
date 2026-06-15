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

## Unified output layout (breaking)

| Area                        | Previous                     | Now                                                |
| --------------------------- | ---------------------------- | -------------------------------------------------- |
| CLI docs root flag          | `--cwd`                      | **`--docs-root`**                                  |
| `outputDir` default         | `.`                          | **`_build`**                                       |
| Guide shard dir (no `path`) | `{outputDir}/{name}/`        | **`{docsRoot}/{name}/`**                           |
| Default compile output      | Monolith `guides.md`         | **Per-guide** `{name}.md` or `guide.md`            |
| Monolith                    | Always (default `guides.md`) | **Opt-in** via `outputFile`                        |
| `refs.registryFile`         | `refs.json`                  | **`.caches/refs.json`**                            |
| Generated paths             | Mixed bases                  | **All relative to `outputDir`** (absolute allowed) |

**Preserve old layout temporarily:** set `"outputDir": "."`, `"outputFile": "guides.md"`, `"refs": { "registryFile": "refs.json" }` explicitly.

**One guide = one subdirectory** of the docs root; `compileOrder` selects which folders compile. See [Config essentials — path layout](../client-cli/config-essentials.md#path-layout).

## reviewLinks removal (0.3.x → next)

- **`hooksConfig.reviewLinks.targetMonolith`** — remove; use per-guide `compile.outputFile` (assembly rewrites links automatically)
- **`"hooks"` listing `reviewLinks`** or `{ "reviewLinks": false }` — remove; hook deleted; cross-guide rewrite is assembly-time
- **Shard `.md` links for one guide** — `compile.crossGuideLinks.ignoreGuides` on the compiling guide; see [Cross-guide link rewriting](../client-core/compile-hooks/cross-guide-links.md)

`targetMonolith` has no one-for-one replacement. Legacy single-monolith layouts should adopt per-guide `compile.outputFile`, or list guides in `ignoreGuides` when compiled output must keep shard paths.

## md-tree fork criteria

Document in [Design constraints](./design-constraints/fork-criteria.md) when:

- `assemble` needs heading-transform hooks
- `explode` needs preamble without synthetic H2
- Upstream unresponsive
