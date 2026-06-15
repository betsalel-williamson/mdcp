# Developer Guide

**Audience:** contributors and maintainers working on the mdcp monorepo.

This guide covers local setup, package development, sharded documentation in `docs/`, changesets, and npm releases. For what mdcp **does** as a tool (commands, design, consumer migration), read the [Feature Catalog](README.md#feature-catalog).

Contributors are expected to follow the [Contributor Covenant Code of Conduct](README.md#contributor-covenant-code-of-conduct).

## Glossary

Shared acronyms and terms for all mdcp docs. Spell out on first use in a shard and link the short form here.

### MDCP

**MarkDown Context Protocol** — a protocol for repository documentation context: sharded intent and design in Markdown, validated compile output for agents, CI, and human readers. The CLI is one surface; `compile`, `check`, `refs lookup`, and `export --llm` implement the shared context layer.

### GFM

**GitHub Flavored Markdown** — standard Markdown plus GitHub extensions (tables, task lists, fenced code). Not Pandoc, LaTeX, or wikilinks.

### Authored GFM

Shard markdown as written before compile — no preprocessor substitution or template conditionals. Compile hooks may transform it during assembly; see [Preprocessor / templating (out of scope)](README.md#preprocessor-templating-out-of-scope).

## Local setup

### Requirements

- Node.js **>= 22.12.0** (see `engines` in root [`package.json`](package.json); [`.nvmrc`](.nvmrc) pins major version `22` for `nvm use`)
- [pnpm](https://pnpm.io/) 9.x (see `packageManager` in root [`package.json`](package.json))
- [Vale](https://vale.sh/docs/vale-cli/installation/) on `PATH` for prose lint (`pnpm docs:check` uses `--require-vale`). macOS: `brew install vale`; Linux: `snap install vale` or a [GitHub release](https://github.com/vale-cli/vale/releases) tarball. CI pins **3.15.1**.

### First-time bootstrap

```bash
pnpm install
pnpm build
pnpm vale:sync            # once — requires Vale on PATH; syncs styles for docs/ and examples/sample-guides/
```

### Work-item tracking setup step

If you use coding agents with task-type prompts ([examples/prompts/](examples/prompts/)), document how to load tracker issues **once per repo**. This project maintains that in [Agent work-item tracking](README.md#agent-work-item-tracking) — add it to your setup checklist alongside install and build steps. Consumer repos should add a similar shard under `docs/developer/` and link it from local setup.

### Daily commands

| Command                  | Purpose                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `pnpm build`             | Build all packages (`mdcp-core`, `mdcp-cli`)                             |
| `pnpm test`              | Run `vitest` in `mdcp-core`                                              |
| `pnpm run typecheck`     | TypeScript across packages                                               |
| `pnpm run lint`          | ESLint on TypeScript sources                                             |
| `pnpm run format:check`  | Prettier check                                                           |
| `pnpm run check`         | Full gate: typecheck, lint, format, build, test, `docs:check`            |
| `pnpm docs:compile:repo` | Regenerate compiled docs (`guides.md`, `DEVELOPERS.md`, package READMEs) |
| `pnpm docs:check`        | Validate repo docs + `examples/sample-guides`                            |

Optional locally: `brew install gitleaks` (CI always scans).

### Git hooks

Pre-commit runs in two phases:

| Phase           | What runs                                                                                |
| --------------- | ---------------------------------------------------------------------------------------- |
| lint-staged     | Prettier and ESLint on staged files (including `.jsonc`)                                 |
| affected checks | `scripts/pre-commit-affected.mjs` — build and test only packages touched by staged paths |

| Staged paths                                            | Extra checks                                             |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `packages/mdcp-core/**`                                 | typecheck, build, `vitest related` on changed files      |
| `packages/mdcp-cli/**`                                  | core build (dependency), then cli typecheck, build, test |
| `packages/mdcp-presets/**`                              | JSONC preset validation                                  |
| `docs/**`, `DEVELOPERS.md`, package README shards       | `docs:compile:repo` + `docs:check:repo`                  |
| Root config (`package.json`, lockfile, eslint/tsconfig) | repo-wide typecheck + `format:check`                     |

CI runs the full gate: `pnpm run check`.

## Agent work-item tracking

How coding agents load tracker issues and delivery conventions **for this repository**. Task-type prompts in [examples/prompts/](examples/prompts/) point here via `WORK_ITEM_LOOKUP`.

Configure an equivalent shard in consumer repos during [local setup](README.md#local-setup).

### Tracker

```text
Host=GitHub (betsalel-williamson/mdcp)
Issue base URL=https://github.com/betsalel-williamson/mdcp/issues/
WORK_ITEM=issue number (e.g. 39) or full issue URL
```

### Load scope (pick what your agent has)

**GitHub CLI** (when `gh` is on `PATH` and authenticated):

```bash
gh issue view <number> --comments
```

**GitHub MCP** (when enabled in Cursor or another host): use GitHub issue tools to fetch the issue named in `WORK_ITEM` — title, body, labels, and comments.

If none of the above apply, inspect enabled MCP tool descriptors or run `gh --help` / `gh issue view --help` before guessing commands.

### Git and delivery

```text
Integration branch=main (pull before branching)
Feature branches=descriptive (e.g. feature/issue-29-default-compile-hooks)
One branch per WORK_ITEM=do not mix unrelated features, designs, or doc scopes in one PR
Branch before work=create the feature branch before shards, tests, or code
Commits=conventional; atomic and logically grouped
Release notes=changeset in .changeset/ for user-facing doc changes
Docs=describe current behavior only; removed or breaking behavior belongs in changeset release notes, not feature/client shards
Code review=gh pr create; link WORK_ITEM in PR body (Closes #N when appropriate)
```

### Workflow best practices

1. **Load scope** — fetch WORK_ITEM (title, body, acceptance criteria) before planning or editing.
2. **Branch first** — `git checkout main`, pull, then `git checkout -b feature/...` tied to the issue. Never start on `main`.
3. **Stay focused** — one feature or design at a time. Treat acceptance criteria as the boundary unless WORK_ITEM explicitly expands scope.
4. **Docs describe now** — update shards to match as-built behavior. Do not document superseded workflows in `docs/features/` or `docs/client/`; record that in the changeset instead.

### Example prompt header

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=Branch from main (pull first). One issue per branch. Load WORK_ITEM per docs/developer/agent-work-item-tracking.md.
```

For task-type prompt templates, read [LLM collaboration](README.md#llm-collaboration).

## Repository layout

```text
mdcp/
├── CODE_OF_CONDUCT.md      # Contributor Covenant (committed)
├── DEVELOPERS.md           # Compiled from docs/developer/ (committed)
├── packages/
│   ├── mdcp-core/          # @bwilliamson/mdcp-core — compile, refs, validation library
│   ├── mdcp-cli/           # @bwilliamson/mdcp-cli — `mdcp` CLI binary
│   └── mdcp-presets/       # @bwilliamson/mdcp-presets — markdownlint starter configs
├── docs/                   # Sharded docs (mdcp.config.json) — dogfood target
│   ├── glossary/           # Shared acronyms and terms (cross-guide, like insert libraries)
│   ├── features/           # Tool capabilities → docs/_build/guides.md (local review, gitignored)
│   ├── developer/          # This guide → DEVELOPERS.md
│   ├── client-cli/         # → packages/mdcp-cli/README.md
│   └── client-core/        # → packages/mdcp-core/README.md
├── examples/sample-guides/ # Minimal consumer fixture for tests and tutorials
├── legacy/                 # Original bash/Python reference implementation
├── .changeset/             # Changesets for semver releases
└── .github/workflows/      # CI and release automation
```

### Published packages

All three npm packages share one version (fixed versioning via Changesets). Each ships `dist/` and a generated or hand-authored `README.md` in its tarball.

`mdcp-presets` README is hand-authored for now. CLI and core READMEs are **compiled** from `docs/client-cli/` and `docs/client-core/` shards.

## Packages and tests

### mdcp-core

Library source: [`packages/mdcp-core/src/`](packages/mdcp-core/src/).

| Area               | Path                          |
| ------------------ | ----------------------------- |
| Config schema      | `src/config/`                 |
| Compile / assemble | `src/compile/`                |
| Refs / slugs       | `src/refs/`                   |
| Validation         | `src/validate/`, `src/xrefs/` |
| Shard (split)      | `src/shard/`                  |
| Export (LLM)       | `src/export/`                 |
| Peer linters       | `src/peers/`                  |

```bash
pnpm --filter @bwilliamson/mdcp-core test
pnpm --filter @bwilliamson/mdcp-core run typecheck
```

Tests live under `packages/mdcp-core/test/`. Integration tests invoke the built CLI against `examples/sample-guides/`.

### mdcp-cli

Thin Commander wrapper around `mdcp-core`. Source: [`packages/mdcp-cli/src/cli.ts`](packages/mdcp-cli/src/cli.ts).

```bash
pnpm --filter @bwilliamson/mdcp-cli run build
node packages/mdcp-cli/dist/cli.js --help
```

### mdcp-presets

JSONC markdownlint configs only — no TypeScript build. Edit `*.markdownlint-cli2.jsonc` directly.

### Pull request checklist

1. `pnpm run build && pnpm test`
2. `pnpm run lint && pnpm run format:check`
3. `pnpm docs:compile:repo && pnpm docs:check` if you touched `docs/` shards
4. `pnpm changeset` if you changed published package behavior (see [Versioning and releases](README.md#versioning-and-releases))

CI runs the same core gates as `pnpm run check` (typecheck, lint, format, build, test, `docs:check`), plus:

- `pnpm run verify:peers` — confirm markdownlint-cli2 and Vale are on PATH
- `pnpm audit --audit-level=high` — dependency vulnerability scan
- `pnpm run prepare:docs` — `verify:peers` + `vale:sync` before `docs:check`

Pull requests also run the **changeset** job when package sources change.

## Docs dogfooding

This repo's documentation is sharded under [`docs/`](docs/). Shards are the **source of truth**; compiled output is generated.

### Guide directories

| Directory      | Audience                         | Output                                            |
| -------------- | -------------------------------- | ------------------------------------------------- |
| `glossary/`    | Shared terms (cross-guide)       | Stitched into every guide via manifest link       |
| `features/`    | Tool capabilities, migration map | `docs/_build/guides.md` (gitignored local review) |
| `developer/`   | Contributing to this repo        | `DEVELOPERS.md` at repo root                      |
| `client-cli/`  | npm CLI consumers                | `packages/mdcp-cli/README.md`                     |
| `client-core/` | Programmatic API consumers       | `packages/mdcp-core/README.md`                    |

Config: [`docs/mdcp.config.json`](docs/mdcp.config.json). Guides with `compile.outputFile` publish to a separate path and are **excluded** from the monolith.

Repo scripts use `--config docs/mdcp.config.json --docs-root docs`: the config path is resolved from the **repo root** (invocation directory), while `--docs-root docs` sets the shard tree root. See [Config essentials — path resolution](README.md#--docs-root-vs---config-path-resolution).

The **features** compile (`docs/_build/guides.md`) is for reading through the stitched doc during review — edit shards, not the generated file. It is not committed.

### Edit workflow

1. Edit shard `.md` files under the relevant guide directory.
2. If you changed a guide's `index.md` link order, re-run compile — order is read from the manifest. See [Manifest compile order](README.md#manifest-compile-order) when using `compile.sectionsHeading`.
3. Run `pnpm docs:compile:repo` then `pnpm docs:check:repo`.
4. Commit shard changes. Regenerated `docs/_build/` (monolith, per-guide outputs, `.caches/refs.json`) is gitignored — CI and `pnpm docs:check` compile locally. Commit [`DEVELOPERS.md`](README.md#developer-guide) when `developer/` shards change; commit package READMEs when `client-cli/` or `client-core/` shards change.

### Agent context

```bash
pnpm docs:context    # mdcp export --llm from features monolith only
```

The monolith compiles **`features`** only (see `compileOrder` in config). The developer guide, consumer publish guides, and npm README outputs are omitted from LLM export source.

### Linting docs

- **markdownlint** — shard preset + compiled preset (includes `DEVELOPERS.md` and published README paths)
- **Vale** — prose lint on `glossary/`, `features/`, `developer/`, `client-cli/`, `client-core/` (install [Vale](https://vale.sh/docs/vale-cli/installation/) on `PATH`; not an npm dependency)
- **xref lint** — `mdcp check` flags bare `Ch. N` and unlinked chapter references in shards

Run `pnpm vale:sync` after cloning or when `.vale.ini` changes (requires Vale on `PATH`).

## Versioning and releases

mdcp uses [Semantic Versioning 2.0.0](https://semver.org/) and [Changesets](https://github.com/changesets/changesets) for predictable npm releases. All three published packages share one version number.

| Package      | npm name                    |
| ------------ | --------------------------- |
| CLI          | `@bwilliamson/mdcp-cli`     |
| Core library | `@bwilliamson/mdcp-core`    |
| Lint presets | `@bwilliamson/mdcp-presets` |

Fixed versioning is configured in [`.changeset/config.json`](.changeset/config.json) — bump one, bump all.

### Release schedule (lightweight)

There is **no calendar cadence**. Releases are **event-driven**:

1. Contributors add a changeset with each PR that affects published behavior.
2. Changes accumulate on `main`.
3. When ready, a maintainer runs **`pnpm release:tag:push`** to version, tag, and push.
4. CI publishes to npm when the **`v*`** tag lands on GitHub.

Typical rhythm for an active dev project: **a few releases per month**, batched when there is something worth shipping — not on a fixed weekly/monthly schedule.

### Pre-1.0 policy (`0.x.y`)

The project is **pre-1.0**. Until **1.0.0**, there is **no API stability guarantee** — exported library APIs, CLI commands and flags, `mdcp.config.json` schema, and compile output shape may change in any `0.x.y` release without a semver-major bump.

Treat versions as:

| Bump                     | When                                                                                | Examples                                                 |
| ------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **patch**                | Bug fixes, internal refactors with no intended API change                           | compile heading fix, orphan check false positive         |
| **minor**                | New commands, config fields, hooks, or behavior additions                           | new `mdcp` subcommand, new compile hook, new preset rule |
| **major** (within `0.x`) | Breaking CLI flags, config schema removals, output format changes consumers rely on | rename config key, change compiled heading rules         |

At **1.0.0**, semver applies strictly: breaking changes require a major bump.

### When to add a changeset

Run `pnpm changeset` and commit the generated file under `.changeset/` when a PR changes:

- `packages/mdcp-core/src/**`
- `packages/mdcp-cli/src/**`
- `packages/mdcp-presets/*.jsonc`
- Published package `package.json` metadata consumers depend on

**Skip a changeset** for:

- Root `README.md`, `docs/`, `examples/` only
- CI, Husky, or dev tooling that does not ship in npm tarballs
- Typo fixes in package READMEs with no behavior change (maintainer discretion)

CI on pull requests runs `pnpm changeset:status` to catch missing changesets when package code changed.

### Bump selection guide

When **adding** a changeset in a PR, pick the bump that best describes your change (the maintainer confirms the final bump at release):

| Your change                                                                 | Suggested bump         |
| --------------------------------------------------------------------------- | ---------------------- |
| Fixes incorrect output or validation                                        | **patch**              |
| Adds optional config or a new non-breaking command                          | **minor**              |
| Removes or renames config, changes compile output shape, drops Node support | **major**              |
| Republish without API change (CI, tooling, registry metadata)               | **build** (at release) |

At release, `pnpm release:tag` lets the maintainer choose **patch / minor / major / build** and requires typing the version plus an explicit `yes` — non-interactive tools cannot release.

### Release flow (maintainers)

#### Day-to-day

```bash
pnpm changeset          # interactive; commit the new .changeset/*.md file
```

#### Verify locally (optional)

```bash
pnpm changeset:status   # fails if package changes since origin/main lack a changeset
```

#### Tag and publish (maintainers)

When changesets have accumulated on `main`, a **human** runs the interactive release script in a terminal. It cannot run in CI or non-interactive shells (LLM agents cannot bump versions).

```bash
pnpm run check              # optional gate
pnpm release:tag            # interactive: pick bump, confirm, commit, tag
git push origin main && git push origin vX.Y.Z   # triggers CI publish
```

Or one step (still interactive):

```bash
pnpm release:tag:push       # same prompts, then push main + tag
```

Preview without writes: `pnpm release:tag --dry-run`

#### Bump types (chosen at release time)

| Choice | Bump      | Use for                                                  |
| ------ | --------- | -------------------------------------------------------- |
| 1      | **patch** | Bug fixes, no intended API change                        |
| 2      | **minor** | New features, backward compatible                        |
| 3      | **major** | Breaking CLI, config, or compile output                  |
| 4      | **build** | Republish same API (`0.1.0-build.1`, `0.1.0-build.2`, …) |

#### Human confirmation gate

1. Select bump type `1`–`4`
2. Type the exact tag (e.g. `v0.2.0`) to confirm
3. Answer `yes` to “Do you really want to do this?”

Without a TTY, the script exits immediately.

The [release workflow](.github/workflows/release.yml) runs on **`v*` tag push**, verifies the tag matches `packages/mdcp-cli/package.json` version, builds, runs `changeset publish`, and opens a GitHub Release.

#### Automated (after tag push)

1. CI checks out the tagged commit.
2. `pnpm build` then `pnpm changeset publish` with npm provenance (OIDC).
3. GitHub Release is created with generated release notes.

#### Manual fallback

See [Publishing](README.md#publishing).

### Changelogs

Changesets writes per-package `CHANGELOG.md` files under `packages/*/` when you run `pnpm release:tag` (via `changeset version`). Consumers can read:

- GitHub Releases (summary from the action)
- `packages/mdcp-cli/CHANGELOG.md` (and core/presets) on the tag

### Supported versions

Security fixes target the **latest minor** on npm. See [SECURITY.md](README.md#security-policy) for the supported-versions table — update that table when cutting a new minor line.

### Related docs

- [Publishing](README.md#publishing) — first publish, Trusted Publishing, npm commands
- [.changeset/README.md](README.md#changesets) — quick changeset reference

## Publishing

Packages: `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-presets` (fixed versioning via Changesets)

### Prerequisites

- npm account **`bwilliamson`** with access to publish `@bwilliamson/*`
- **2FA enabled** on npm (auth-and-writes) for all publishers
- `pnpm install` at repo root (includes `@changesets/cli`)

### First-time publish (chicken-and-egg)

npm **cannot** configure Trusted Publishing (`npm trust` or the website UI) until the package record exists on the registry. A 404 on:

```text
POST https://registry.npmjs.org/-/package/@bwilliamson%2fmdcp-cli/trust
```

means the package has not been published yet — not that the command syntax is wrong.

**First publish must happen from your machine** with `npm login` (classic auth). After that, configure OIDC for CI.

#### Step 1 — Publish locally (one time)

```bash
npm install -g npm@latest
npm login                    # log in as bwilliamson; complete 2FA when prompted

cd /path/to/mdcp
pnpm install
pnpm build
pnpm changeset publish       # publishes all three @bwilliamson/mdcp-* packages at 0.1.0
```

Verify:

```bash
npm view @bwilliamson/mdcp-cli version
npm view @bwilliamson/mdcp-core version
npm view @bwilliamson/mdcp-presets version
```

#### Step 2 — Configure Trusted Publishing (after packages exist)

Option A — npm website (easiest):

1. Open each package → **Settings** → **Trusted Publisher** → **GitHub Actions**
2. Repository: `betsalel-williamson/mdcp`
3. Workflow filename: `release.yml` (filename only, including `.yml`)
4. Allow action: **npm publish**

Repeat for `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, and `@bwilliamson/mdcp-presets`.

Option B — CLI (after packages exist):

```bash
npm trust github @bwilliamson/mdcp-cli     --file release.yml --repo betsalel-williamson/mdcp --allow-publish -y
npm trust github @bwilliamson/mdcp-core    --file release.yml --repo betsalel-williamson/mdcp --allow-publish -y
npm trust github @bwilliamson/mdcp-presets --file release.yml --repo betsalel-williamson/mdcp --allow-publish -y
```

#### Step 3 — Future releases via CI

Tag a release from an **interactive terminal** on `main`; CI publishes when the tag is pushed:

```bash
pnpm release:tag:push
```

You will choose patch / minor / major / build and confirm by typing the version. Agents and CI cannot run this script.

Trusted Publishing must reference workflow **`release.yml`** (trigger: **`v*` tags**). See [Versioning and releases](README.md#versioning-and-releases).

### Trusted Publishing notes

- Repository: `betsalel-williamson/mdcp`, workflow: `release.yml`
- Revoke any legacy `NPM_TOKEN` secrets from GitHub once OIDC is verified
- The release workflow uses OIDC (`id-token: write`) and `NPM_CONFIG_PROVENANCE=true`

### Release workflow

1. Merge PRs with changesets to `main`.
2. Run **`pnpm release:tag:push`** on `main` (applies changesets, tags `vX.Y.Z`, pushes).
3. [`.github/workflows/release.yml`](.github/workflows/release.yml) publishes to npm on tag push (OIDC, no `NPM_TOKEN`).

Preview locally:

```bash
pnpm release:tag --dry-run
```

Manual fallback (publish from your machine, not CI):

```bash
pnpm run check
pnpm changeset
pnpm changeset version
git add . && git commit -m "chore: version packages"
pnpm build
pnpm changeset publish
```

Changesets config: [`.changeset/config.json`](.changeset/config.json) — all three packages version together.

### Install surfaces

| Use case       | Command                                                               |
| -------------- | --------------------------------------------------------------------- |
| Dev dependency | `npm i -D @bwilliamson/mdcp-cli @bwilliamson/mdcp-presets`            |
| Global CLI     | `npm i -g @bwilliamson/mdcp-cli`                                      |
| Programmatic   | `import { compileGuides, stripForLlm } from '@bwilliamson/mdcp-core'` |

Each package runs `prepublishOnly` to build (or verify) before publish.

See [SECURITY.md](README.md#security-policy) for vulnerability reporting.
