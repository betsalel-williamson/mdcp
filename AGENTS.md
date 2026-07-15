# AGENTS.md

## Cursor Cloud specific instructions

This repo (`mdcp`) is a **pnpm monorepo** whose "application" is the `mdcp`
CLI/library toolchain (packages `mdcp-core`, `mdcp-cli`, `mdcp-presets`) — there
is no web server. Standard commands and their purpose are documented in
[`DEVELOPERS.md`](DEVELOPERS.md) ("Daily commands") and root `package.json`
scripts; use those as the source of truth. Notes below are the non-obvious
environment caveats.

### Node version (important)

- The repo requires Node **>= 24** with `engine-strict=true` (`.npmrc`), so pnpm
  hard-fails on the wrong Node.
- The VM injects `/exec-daemon/node` (**v22**) at the front of `PATH`, which
  shadows the nvm-managed Node 24. Interactive shells fix this via a `PATH`
  prepend appended to `~/.bashrc`; the startup update script selects Node 24
  itself. If you spawn a bare non-interactive shell and hit an engine error,
  run `nvm use 24 && export PATH="$(dirname "$(nvm which 24)"):$PATH"` first.

### Vale (prose linter)

- `pnpm docs:check` runs with `--require-vale`, so the `vale` binary must be on
  `PATH`. It is **not** an npm dependency — it is installed as a system binary
  (`~/.local/bin/vale`, pinned to CI's 3.15.1) and added to `PATH` via
  `~/.bashrc`.
- After a fresh clone or when `.vale.ini` changes, run `pnpm vale:sync` to
  fetch styles into `docs/styles/` and `examples/sample-guides/styles/` (both
  gitignored). This has already been run in the snapshot.

### Running / verifying

- Build first (`pnpm build`); the CLI runs from its build output:
  `node packages/mdcp-cli/dist/cli.js --help`.
- Core flow: `mdcp compile` stitches Markdown shards into a monolith (rewriting
  cross-links + refs), and `mdcp check` validates lint/refs/xrefs/prose. `check`
  runs Vale by default — pass `--skip-vale` when a docs set has no `.vale.ini`.
- Full CI-equivalent gate: `pnpm run check` (typecheck, lint, format:check,
  build, test, skill:lint, skill:validate, docs:check).
- Compiled `docs/_build/` output is gitignored; edit shards, not generated
  files.
