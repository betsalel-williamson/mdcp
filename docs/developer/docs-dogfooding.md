# Docs dogfooding

This repo's documentation is sharded under [`docs/`](../). Shards are the **source of truth**; compiled output is generated.

## Guide directories

| Directory      | Audience                                          | Output                                             |
| -------------- | ------------------------------------------------- | -------------------------------------------------- |
| `features/`    | Tool capabilities, design, consumer migration map | `docs/guides.md` (local review — gitignored)       |
| `developer/`   | Contributing to this repo (this guide)            | [`DEVELOPERS.md`](../../DEVELOPERS.md) (committed) |
| `client-cli/`  | npm CLI consumers                                 | `packages/mdcp-cli/README.md`                      |
| `client-core/` | Programmatic API consumers                        | `packages/mdcp-core/README.md`                     |

Config: [`docs/mdcp.config.json`](../mdcp.config.json). Guides with `compile.outputFile` publish to a separate path and are **excluded** from the monolith.

The **features** compile (`docs/guides.md`) is for reading through the stitched doc during review — edit shards, not the generated file. It is not committed.

## Edit workflow

1. Edit shard `.md` files under the relevant guide directory.
2. If you changed a guide's `index.md` links, run `mdcp sections --config mdcp.config.json --cwd docs`. This writes `sections.txt` with **guide-relative** shard filenames (for example `local-setup.md`) — never absolute paths.
3. Run `pnpm docs:compile:repo` then `pnpm docs:check:repo`.
4. Commit shard changes. Regenerated `docs/guides.md` and `docs/refs.json` are gitignored — CI and `pnpm docs:check` compile them locally. Commit [`DEVELOPERS.md`](../../DEVELOPERS.md) when `developer/` shards change; commit package READMEs when `client-cli/` or `client-core/` shards change.

## Agent context

```bash
pnpm docs:context    # mdcp export --llm from features monolith only
```

The monolith compiles **`features`** only (see `compileOrder` in config). The developer guide, consumer publish guides, and npm README outputs are omitted from LLM export source.

## Linting docs

- **markdownlint** — shard preset + compiled preset (includes `DEVELOPERS.md` and published README paths)
- **Vale** — prose lint on `features/`, `developer/`, `client-cli/`, `client-core/`
- **xref lint** — `mdcp check` flags bare `Ch. N` and unlinked chapter references in shards

Run `pnpm vale:sync` after cloning or when `.vale.ini` changes.
