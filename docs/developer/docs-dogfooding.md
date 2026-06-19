# Docs dogfooding

This repo's documentation is sharded under [`docs/`](../). Shards are the **source of truth**; compiled output is generated.

## Guide directories

| Directory      | Audience                         | Output                                            |
| -------------- | -------------------------------- | ------------------------------------------------- |
| `glossary/`    | Shared terms (cross-guide)       | One shard per term; scoped transitive stitch      |
| `features/`    | Tool capabilities, migration map | `docs/_build/guides.md` (gitignored local review) |
| `developer/`   | Contributing to this repo        | `DEVELOPERS.md` at repo root                      |
| `client-cli/`  | npm CLI consumers                | `packages/mdcp-cli/README.md`                     |
| `client-core/` | Programmatic API consumers       | `packages/mdcp-core/README.md`                    |

Config: [`docs/mdcp.config.json`](../mdcp.config.json). Guides with `compile.outputFile` publish to a separate path and are **excluded** from the monolith.

### Upstream refs (dogfood)

`mdcp.config.json` pins **`protocol.profile`** (`alpha` for `valpha`) and **`protocol.ref`** (`v0.4.1`) so `mdcp export --llms-index --fetch` and extension cache pulls resolve the open-alpha tag on GitHub. Bump `protocol.ref` when cutting the next alpha release tag.

Remote `--fetch` with `ref: v0.4.1` requires the **`v0.4.1` git tag** on `main`. Local verification uses in-repo `spec/` via `pnpm docs:compile:repo` (no network). `--fetch-local` from repo root also copies from `spec/` without GitHub.

Shard `../` links in publish guides (`developer`, `client-cli`, `client-core`) rebase automatically at compile — resolve from each shard file to an absolute path, then emit a path relative to the publish output. No per-guide path-prefix config. See [Publish-relative link rewriting](../client-core/compile-hooks/publish-relative-links.md).

Repo scripts use `--config docs/mdcp.config.json --docs-root docs`: the config path is resolved from the **repo root** (invocation directory), while `--docs-root docs` sets the shard tree root. See [Config essentials — `--config` vs `--docs-root`](../client-cli/config-essentials.md#--config-vs---docs-root).

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
- **Vale** — prose lint on `glossary/`, `features/`, `developer/`, `client-cli/`, `client-core/` (install [Vale](https://vale.sh/docs/vale-cli/installation/) on `PATH`; not an npm dependency)
- **xref lint** — `mdcp check` flags bare `Ch. N` and unlinked chapter references in shards
- **link lint** — built-in validation runs on every `docs:check` with default `"error"` severity; publish guides set `compile.crossGuideLinks.ignoreGuides: ["features"]` so cross-guide links keep live `docs/features/` shard paths (publish-relative rebase only); see [Publish-only link policy](../features/link-validation.md#publish-only-link-policy)

Run `pnpm vale:sync` after cloning or when `.vale.ini` changes (requires Vale on `PATH`).
