# Docs dogfooding

This repo's documentation is sharded under [`docs/`](../). Shards are the **source of truth**; compiled output is generated.

## Guide directories

| Directory      | Audience                         | Output                                             |
| -------------- | -------------------------------- | -------------------------------------------------- |
| `glossary/`    | Shared terms (cross-guide)       | Stitched into `features` compile via manifest link |
| `features/`    | Tool capabilities, migration map | `docs/_build/guides.md` (gitignored local review)  |
| `developer/`   | Contributing to this repo        | `DEVELOPERS.md` at repo root                       |
| `client-cli/`  | npm CLI consumers                | `packages/mdcp-cli/README.md`                      |
| `client-core/` | Programmatic API consumers       | `packages/mdcp-core/README.md`                     |

Config: [`docs/mdcp.config.json`](../mdcp.config.json). Guides with `compile.outputFile` publish to a separate path and are **excluded** from the monolith.

Repo scripts use `--config docs/mdcp.config.json --docs-root docs`: the config path is resolved from the **repo root** (invocation directory), while `--docs-root docs` sets the shard tree root. See [Config essentials — path resolution](../client-cli/config-essentials.md#--docs-root-vs---config-path-resolution).

The **features** compile (`docs/_build/guides.md`) is for reading through the stitched doc during review — edit shards, not the generated file. It is not committed.

## Edit workflow

1. Edit shard `.md` files under the relevant guide directory.
2. If you changed a guide's `index.md` link order, re-run compile — order is read from the manifest. See [Manifest compile order](../features/manifest-compile-order.md) when using `compile.sectionsHeading`.
3. Run `pnpm docs:compile:repo` then `pnpm docs:check:repo`.
4. Commit shard changes. Regenerated `docs/_build/` (monolith, per-guide outputs, `.caches/refs.json`) is gitignored — CI and `pnpm docs:check` compile locally. Commit [`DEVELOPERS.md`](../../DEVELOPERS.md) when `developer/` shards change; commit package READMEs when `client-cli/` or `client-core/` shards change.

## Agent context

```bash
pnpm docs:context    # mdcp export --llm from features monolith only
```

The monolith compiles **`features`** only (see `compileOrder` in config). The developer guide, consumer publish guides, and npm README outputs are omitted from LLM export source.

## Linting docs

- **markdownlint** — shard preset + compiled preset (includes `DEVELOPERS.md` and published README paths)
- **Vale** — prose lint on `features/`, `developer/`, `client-cli/`, `client-core/` (install [Vale](https://vale.sh/docs/vale-cli/installation/) on `PATH`; not an npm dependency)
- **xref lint** — `mdcp check` flags bare `Ch. N` and unlinked chapter references in shards

Run `pnpm vale:sync` after cloning or when `.vale.ini` changes (requires Vale on `PATH`).
