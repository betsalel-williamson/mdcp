# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **mdcp monorepo** — a documentation-system Agent Skill plus a
TypeScript toolchain (pnpm workspaces). There is **no web app or long-running
server**; the "application" is the `mdcp` CLI (`packages/mdcp-cli`) built on
`packages/mdcp-core`, driven through `pnpm` scripts. Standard contributor
commands live in `DEVELOPERS.md` ("Daily commands") and root `package.json`
scripts — use those rather than duplicating them here.

### Environment already provisioned (do not re-run in normal sessions)

- The startup update command lives in `.cursor/environment.json` (`install`):
  it runs `git fetch --all --prune --tags` (non-fatal, refreshes remote-tracking
  branches) then `pnpm install`. That committed file is the source of truth and
  takes precedence over any dashboard-saved environment. Package manager is
  pinned via `packageManager` in `package.json`.
- Node deps: `pnpm install` runs automatically on VM startup (the update
  script). Package manager is pinned via `packageManager` in `package.json`.
- **Vale** (prose linter) is a **peer binary**, not an npm dependency. Version
  **3.15.1** is installed at `/usr/local/bin/vale` and persists in the VM
  snapshot. `pnpm run docs:check` / `pnpm run check` invoke Vale with
  `--require-vale`, so it must stay on `PATH`. If it ever goes missing, reinstall
  from the GitHub release (`vale-cli/vale`, `v3.15.1`, `Linux_64-bit`) — the
  exact command is in `.github/workflows/ci.yml`.

### Non-obvious gotchas

- **Build before running the CLI or docs scripts.** The `docs:*` scripts and the
  `mdcp` binary run `node packages/mdcp-cli/dist/cli.js`, so `dist/` must exist.
  Run `pnpm build` after a fresh checkout or after editing `packages/*/src`
  before `pnpm docs:check` / `pnpm docs:compile` / invoking the CLI. `dist/` is
  gitignored and is **not** produced by the startup update script.
- **Run `pnpm vale:sync` before the first `docs:check`** on a fresh clone (or
  after `.vale.ini` changes). It downloads Vale style packages (network
  required) into gitignored `styles/` dirs; synced styles persist in the
  snapshot.
- `pnpm docs:check` regenerates and diffs compiled outputs. Committed compiled
  files (`README.md`, `DEVELOPERS.md`, package `README.md`s) are derived from
  `docs/` shards — edit the shards and run `pnpm docs:compile:repo`, never hand-
  edit the compiled files. CI fails on `git diff` if they are stale.
- Node on this VM is v22 (satisfies `engines >=18`); CI uses Node 24. Do not
  switch Node via nvm/`.nvmrc` unless a version-specific issue appears.
- `gitleaks` is not installed; the pre-commit hook prints a warning and
  continues (CI runs the real scan).

### Cloud-agent limitations & workarounds

Human-facing detail: **Cursor Cloud environment** in `DEVELOPERS.md`
(compiled from `docs/developer/cursor-cloud-environment.md`). Key constraints
for agents in this environment:

- `gh` is **read-only** — it cannot create or modify issues or PRs. Use the
  dedicated PR tooling for PRs and PR comments; a human creates GitHub issues
  from agent-supplied text (add `Closes #N` afterward).
- **No GitHub MCP**, and we do not add one in the cloud. MCP servers load at
  session start, `.cursor/*` (except `environment.json`) is gitignored, and a
  GitHub PAT in Secrets is not wired to `gh` or any tool — so it does not
  enable issue creation. Do not rely on it.
- The agent **cannot merge PRs** or push to protected `main` (a human merges).
  It may merge one working branch into another locally to unblock CI (for
  example, a dependency-fix branch into a feature branch).
- CI runs `pnpm audit --audit-level=high` **before** build/test; a new advisory
  on a pre-existing devDependency fails it and masks otherwise-green gates. Fix
  by pinning patched versions via `pnpm-workspace.yaml` `overrides`.
- Merge commits need a **conventional subject** (`chore: merge …`) or commitlint
  rejects them.

### Full verification gate

`pnpm run check` runs typecheck → lint → format:check → build → test →
skill:lint → skill:validate → docs:check (mirrors CI). Vale must be on `PATH`
for the docs portion.
