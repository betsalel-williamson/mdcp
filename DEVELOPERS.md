# Developer Guide

**Audience:** contributors and maintainers working on the mdcp monorepo.

This guide covers local setup, package development, sharded documentation in `docs/`, changesets, and npm releases. For what mdcp **does** as a tool (commands, design, consumer migration), read the [Feature Catalog](docs/features/feature-catalog.md).

Contributors are expected to follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## Glossary

Shared acronyms and terms for all mdcp docs. Spell out on first use in a shard and link the short form here.

Each term is its own shard under `docs/glossary/`. For large glossaries, split manifests across sub-index files (for example `index-protocol.md`, `index-format.md`) and set `compile.scopeRoot` to `glossary` so transitive links pull term shards into other guides. Read [domain glossary](#domain-glossary).

### Protocol terms

- [Agent Skills](#agent-skills)
- [MDCP](#mdcp)
- [protocol version](#protocol-version)
- [mdcp-llms-index](#mdcp-llms-index)

### Format and compile terms

- [GFM](#gfm)
- [Authored GFM](#authored-gfm)
- [ignoreGuides](#ignoreguides)

### Adoption and messaging

- [WIIFM](#wiifm)

## Local setup

### Requirements

- Node.js **>= 24.0.0** (see `engines` in root [`package.json`](package.json); [`.nvmrc`](.nvmrc) pins major version `24` for `nvm use`)
- [pnpm](https://pnpm.io/) 9.x (see `packageManager` in root [`package.json`](package.json))
- [Vale](https://vale.sh/docs/vale-cli/installation/) on `PATH` for prose lint (`pnpm docs:check` uses `--require-vale`). macOS: `brew install vale`; Linux: `snap install vale` or a [GitHub release](https://github.com/vale-cli/vale/releases) tarball. CI pins **3.15.1**.

### First-time bootstrap

```bash
pnpm install
pnpm build
pnpm vale:sync            # once — requires Vale on PATH; syncs styles for docs/ and examples/sample-guides/
```

### Work-item tracking setup step

If you use coding agents with task-type prompts ([spec/extensions/prompts-mdcp-defaults/0.4.0.0/](spec/extensions/prompts-mdcp-defaults/0.4.0.0)), document how to load tracker issues **once per repo**. This project maintains that in [Agent work-item tracking](#agent-work-item-tracking) — add it to your setup checklist alongside install and build steps. Consumer repos should add a similar shard under `docs/developer/` and link it from local setup.

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

How coding agents load tracker issues and delivery conventions **for this repository**. Task-type prompts in [spec/extensions/prompts-mdcp-defaults/0.4.0.0/](spec/extensions/prompts-mdcp-defaults/0.4.0.0) (cached at `.caches/mdcp/prompts/` after fetch) point here via `WORK_ITEM_LOOKUP`.

Configure an equivalent shard in consumer repos during [local setup](#local-setup).

### Tracker

```text
Host=GitHub (betsalel-williamson/mdcp)
Issue base URL=https://github.com/betsalel-williamson/mdcp/issues/
Project board=https://github.com/users/betsalel-williamson/projects/4
WORK_ITEM=issue number (e.g. 39) or full issue URL
```

All repo issues live on the public [MarkDown Context Protocol project board](https://github.com/users/betsalel-williamson/projects/4). **Status** tracks delivery (Todo / In Progress / Done); **Track** groups work by roadmap area (0.5 Spec & adoption, 1.0 Formalization, Maintenance, Performance, Future V2+). Move items to **In Progress** when you start a branch; set **Done** when the issue closes.

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

For task-type prompt templates, read [LLM collaboration](./packages/mdcp-cli/README.md#llm-collaboration).

## Repository layout

```text
mdcp/
├── CODE_OF_CONDUCT.md      # Contributor Covenant (committed)
├── README.md               # Compiled from docs/repo-readme/ (committed)
├── DEVELOPERS.md           # Compiled from docs/developer/ (committed)
├── .agents/skills/mdcp/    # Portable Agent Skill (SKILL.md) — lower install friction
├── packages/
│   ├── mdcp-core/          # @bwilliamson/mdcp-core — compile, refs, validation library
│   ├── mdcp-cli/           # @bwilliamson/mdcp-cli — `mdcp` CLI binary
│   └── mdcp-presets/       # @bwilliamson/mdcp-presets — markdownlint starter configs
├── docs/                   # Sharded docs (mdcp.config.json) — dogfood target
│   ├── glossary/           # Shared acronyms and terms (cross-guide, like insert libraries)
│   ├── features/           # Tool capabilities → docs/_build/guides.md (local review, gitignored)
│   ├── developer/          # This guide → DEVELOPERS.md
│   ├── client-cli/         # → packages/mdcp-cli/README.md
│   ├── client-core/        # → packages/mdcp-core/README.md
│   └── repo-readme/        # → README.md (publish landing)
├── spec/                   # llms-index + extensions (protocol source of truth)
├── examples/sample-guides/ # Minimal consumer fixture for tests and tutorials
├── legacy/                 # Original bash/Python reference implementation
├── .changeset/             # Changesets for semver releases
└── .github/workflows/      # CI and release automation
```

### Published packages

All three npm packages share one version (fixed versioning via Changesets). Each ships `dist/` and a generated or hand-authored `README.md` in its tarball.

`mdcp-presets` README is hand-authored for now. Root `README.md`, CLI, and core READMEs are **compiled** from `docs/repo-readme/`, `docs/client-cli/`, and `docs/client-core/` shards.

## Packages and tests

### mdcp-core

Library source: [`packages/mdcp-core/src/`](packages/mdcp-core/src).

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
4. `pnpm changeset` if you changed published package behavior (see [Versioning and releases](#versioning-and-releases))

CI runs the same core gates as `pnpm run check` (typecheck, lint, format, build, test, `docs:check`), plus:

- `pnpm run verify:peers` — confirm markdownlint-cli2 and Vale are on PATH
- `pnpm audit --audit-level=high` — dependency vulnerability scan
- `pnpm run prepare:docs` — `verify:peers` + `vale:sync` before `docs:check`

Pull requests also run the **changeset** job when package sources change.

## Docs dogfooding

This repo's documentation is sharded under [`docs/`](../). Shards are the **source of truth**; compiled output is generated.

### Guide directories

| Directory      | Audience                         | Output                                            |
| -------------- | -------------------------------- | ------------------------------------------------- |
| `glossary/`    | Shared terms (cross-guide)       | One shard per term; scoped transitive stitch      |
| `features/`    | Tool capabilities, migration map | `docs/_build/guides.md` (gitignored local review) |
| `developer/`   | Contributing to this repo        | `DEVELOPERS.md` at repo root                      |
| `client-cli/`  | npm CLI consumers                | `packages/mdcp-cli/README.md`                     |
| `client-core/` | Programmatic API consumers       | `packages/mdcp-core/README.md`                    |
| `repo-readme/` | GitHub visitors, adopters        | `README.md` at repo root                          |

Config: [`docs/mdcp.config.json`](docs/mdcp.config.json). Guides with `compile.outputFile` publish to a separate path and are **excluded** from the monolith.

Publish landing style for root README: [Personas and priority tiers](docs/features/personas-and-priority-tiers.md#publish-landing-style).

#### Upstream refs (dogfood)

`mdcp.config.json` pins **`protocol.profile`** (`alpha` for `valpha`) and **`protocol.ref`** (`v0.4.1`) so `mdcp export --llms-index --fetch` and extension cache pulls resolve the open-alpha tag on GitHub. Bump `protocol.ref` when cutting the next alpha release tag.

**Dogfood agent index:** do not edit `docs/mdcp.v0.4.llms.txt` (protocol `0.4.0.0` — fetch-only). When `compileOrder` or repo scripts change, bump `protocolVersion` and `protocol.llmsIndex.outputFile` (for example `mdcp.v0.4.0.1.llms.txt`), run `pnpm docs:compile:repo`, and commit the new versioned file.

Remote `--fetch` with `ref: v0.4.1` requires the **`v0.4.1` git tag** on `main`. Local verification uses in-repo `spec/` via `pnpm docs:compile:repo` (no network). `--fetch-local` from repo root also copies from `spec/` without GitHub.

Shard `../` links in publish guides (`developer`, `client-cli`, `client-core`) rebase automatically at compile — resolve from each shard file to an absolute path, then emit a path relative to the publish output. No per-guide path-prefix config. See [Publish-relative link rewriting](./packages/mdcp-core/README.md#publish-relative-link-rewriting).

Repo scripts use `--config docs/mdcp.config.json --docs-root docs`: the config path is resolved from the **repo root** (invocation directory), while `--docs-root docs` sets the shard tree root. See [Config essentials — `--config` vs `--docs-root`](./packages/mdcp-cli/README.md#--config-vs---docs-root).

The **features** compile (`docs/_build/guides.md`) is for reading through the stitched doc during review — edit shards, not the generated file. It is not committed.

### Edit workflow

1. Edit shard `.md` files under the relevant guide directory.
2. If you changed a guide's `index.md` link order, re-run compile — order is read from the manifest. See [Manifest compile order](docs/features/manifest-compile-order.md) when using `compile.sectionsHeading`.
3. Run `pnpm docs:compile:repo` then `pnpm docs:check:repo`.
4. Commit shard changes. Regenerated `docs/_build/` (monolith, per-guide outputs, `.caches/refs.json`) is gitignored — CI and `pnpm docs:check` compile locally. Commit [`DEVELOPERS.md`](DEVELOPERS.md) when `developer/` shards change; commit [`README.md`](README.md) when `repo-readme/` shards change; commit package READMEs when `client-cli/` or `client-core/` shards change.

### Agent context

```bash
pnpm docs:context    # mdcp export --llm from features monolith only
```

The monolith compiles **`features`** only (see `compileOrder` in config). The developer guide, consumer publish guides, and npm README outputs are omitted from LLM export source.

### Linting docs

- **markdownlint** — shard preset + compiled preset (includes `DEVELOPERS.md` and published README paths)
- **Vale** — prose lint on `glossary/`, `features/`, `developer/`, `client-cli/`, `client-core/`, `repo-readme/` (install [Vale](https://vale.sh/docs/vale-cli/installation/) on `PATH`; not an npm dependency)
- **xref lint** — `mdcp check` flags bare `Ch. N` and unlinked chapter references in shards
- **link lint** — built-in validation runs on every `docs:check` with default `"error"` severity; publish guides set `compile.crossGuideLinks.ignoreGuides: ["features"]` so cross-guide links keep live `docs/features/` shard paths (publish-relative rebase only); see [Publish-only link policy](docs/features/link-validation.md#publish-only-link-policy)

Run `pnpm vale:sync` after cloning or when `.vale.ini` changes (requires Vale on `PATH`).

## Agent Skill

Zero-friction MDCP delivery for AI agents uses the portable **parent** Agent Skill at [`.agents/skills/mdcp/SKILL.md`](.agents/skills/mdcp/SKILL.md). Complementary skills (prompts, archetypes, format packs) migrate from [`spec/extensions/`](spec/extensions) into sibling directories under `.agents/skills/`.

The parent skill **succeeds** the agent-facing role of `mdcp.v*.llms.txt`. Keep `spec/llms-index/` and extension packs only while [migration backlog](#migration-backlog) issues remain open.

### Local dogfood

Agents in this repository should discover `.agents/skills/mdcp/` automatically. Manual invoke (hosts that support slash skills): `/mdcp`.

When changing skill instructions:

1. Edit `.agents/skills/mdcp/SKILL.md` (and `references/` as needed).
2. Do **not** invent new protocol in the skill — CLI and schemas stay in packages / `spec/schemas`.
3. For prompts, archetypes, or format packs, prefer complementary skills (or land them via migration issues) instead of growing the parent forever.
4. Update [Agent Skill delivery](docs/features/agent-skill.md) when install or migration phases change.
5. Run `pnpm skill:check` and `pnpm docs:check`.

### Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **Break it down:** Organize information into the smallest possible pieces (shards).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, or incident logs in the durable documentation.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

### Verification

| Command            | Purpose                                                                        |
| ------------------ | ------------------------------------------------------------------------------ |
| `pnpm skill:check` | Deterministic parent-skill evals (frontmatter, triggers, hard-rule assertions) |
| `pnpm docs:check`  | Docs compile + lint gate after shard edits                                     |

`skill:check` is required in local `pnpm check` and in GitHub Actions CI. Changes to the skill or `scripts/check-mdcp-skill.mjs` must keep that step green.

### Optional local improve loop

For qualitative description tuning, install Anthropic's `skill-creator` locally (`npx skills add anthropics/skills --skill skill-creator`). Do **not** require Claude CLI or `skill-creator` in CI.

### Publishing the skill pack

Ship `.agents/skills/mdcp/` (and complementary skill directories as they migrate). Prefer:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

Documented portable path: `.agents/skills/`. Avoid Cursor-only or Marketplace-only packaging for this work.

### Migration backlog

Open (or update) GitHub issues for:

- Epic: migrate agent delivery from llms-index + extensions to Agent Skills
- Child: `prompts-mdcp-defaults` → `mdcp-prompts-defaults`
- Child: `arch-oss-library` → `mdcp-arch-oss-library`
- Child: `arch-product-docs-site` → `mdcp-arch-product-docs-site`
- Child: `format-marp-presentation` → `mdcp-format-marp`
- Child: deprecate / dual-publish path for `mdcp.v*.llms.txt` once the parent skill is authoritative

| Issue                                                    | URL                                                      |
| -------------------------------------------------------- | -------------------------------------------------------- |
| Epic                                                     | <https://github.com/betsalel-williamson/mdcp/issues/102> |
| `prompts-mdcp-defaults` → `mdcp-prompts-defaults`        | <https://github.com/betsalel-williamson/mdcp/issues/103> |
| `arch-oss-library` → `mdcp-arch-oss-library`             | <https://github.com/betsalel-williamson/mdcp/issues/104> |
| `arch-product-docs-site` → `mdcp-arch-product-docs-site` | <https://github.com/betsalel-williamson/mdcp/issues/105> |
| `format-marp-presentation` → `mdcp-format-marp`          | <https://github.com/betsalel-williamson/mdcp/issues/106> |
| Deprecate llms-index as primary bootstrap                | <https://github.com/betsalel-williamson/mdcp/issues/107> |

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

### 0.4.0 open alpha milestone

**0.4.0** is the first public alpha for external testers. It ships llms-index export, built-in link validation, cross-guide link assembly, sharded glossary support, and unified output layout — with breaking changes since 0.3.0 allowed under pre-1.0 policy.

| Track                  | 0.4.0 status                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **npm packages**       | Open alpha — pin `@bwilliamson/mdcp-cli@0.4.0`; no stability guarantee                                                                     |
| **Protocol `0.4.0.0`** | Draft profile (`mdcp.v0.4.llms.txt`); first published llms-index spec; fetch via `--fetch-profile alpha` / `valpha` + `--fetch-ref v0.4.0` |

**Pre-0.4 doc-style evolution:** npm **0.1.0–0.3.0** changes are in [package changelogs](https://github.com/betsalel-williamson/mdcp/blob/main/packages/mdcp-cli/CHANGELOG.md). The **0.4.0** batch (link validation, output layout, glossary manifest, llms-index export, etc.) is recorded in pending [.changeset/](https://github.com/betsalel-williamson/mdcp/tree/main/.changeset/) files — merged into `packages/*/CHANGELOG.md` at release.
| **Roadmap V1 phase** | Reference implementation shipped; not a semver 1.0 stability promise |

**Path to 1.0.0:** npm and protocol graduate together when the core mechanics survive real-world adoption without breaking changes for several months. Until then, iterate in `0.5.x` as feedback arrives.

#### Community feedback

- Visit [github.com/betsalel-williamson/mdcp](https://github.com/betsalel-williamson/mdcp) and **star** the repo to follow progress
- **Open an issue** or **comment on existing issues and PRs** with bugs, adoption stories, or protocol/tooling feedback
- Pin `@bwilliamson/mdcp-cli@0.4.0` and read changelogs before upgrading

#### Open alpha (0.4.0) release checklist

Completed for the **0.4.0** open alpha:

- [x] **`docs/mdcp.config.json`** — `protocol.ref` pinned to `v0.4.0`
- [x] **`.agents/skills/mdcp/agents/getting-started.md`** — phase-2 example `ref`: `v0.4.0`
- [x] **Consumer install docs** — `--fetch-ref v0.4.0` + `--fetch-profile alpha`

Remote `--fetch` with `ref: v0.4.0` requires the **`v0.4.0` git tag** on `main` (pushed by `pnpm release:tag:push`). Protocol version stays **`0.4.0.0`**; only git `ref` pins move between branch dogfood and release tags.

#### Open alpha (0.4.1) patch release checklist

Pending for **0.4.1** (first patch after 0.4.0 open alpha):

- [x] **`docs/mdcp.config.json`** — `protocol.ref` pinned to `v0.4.1`
- [x] **`.agents/skills/mdcp/agents/getting-started.md`** — phase-2 example `ref`: `v0.4.1`
- [x] **Consumer install docs** — `--fetch-ref v0.4.1` + `--fetch-profile alpha`
- [ ] **Three pending changesets** on `main` — `#62` refs registry, `#64` perf, `#57` Node 24 + llms-index indirection
- [ ] **`pnpm release:tag:push`** — human runs interactively; select **patch** → `v0.4.1`

Remote `--fetch` with `ref: v0.4.1` requires the **`v0.4.1` git tag** on `main`. Protocol version stays **`0.4.0.0`**; only git `ref` pins move.

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

### Dependabot

Dependabot does not add changesets. [`.github/workflows/dependabot-changeset.yml`](.github/workflows/dependabot-changeset.yml) runs on Dependabot PRs and commits a **patch** changeset for all three fixed packages when a published package's production dependencies change (`dependencies`, `peerDependencies`, `optionalDependencies`).

| Dependabot PR type                                      | Changeset                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| Production dependency bump in `packages/*/package.json` | Auto **patch** changeset (`.changeset/dependabot-<pr>.md`) |
| Root dev-dependencies (grouped) or GitHub Actions only  | No changeset (workflow no-ops; CI passes)                  |

**One-time setup:** add repository secret `DEPENDENCY_UPDATE_GITHUB_TOKEN` — a fine-grained or classic PAT with **Contents: read/write** on this repo. The default `GITHUB_TOKEN` cannot push in a way that re-triggers CI on Dependabot branches; the PAT does.

**Timing:** the first CI run on a new Dependabot PR may fail the `changeset` job briefly. After the workflow commits the changeset (usually within 1–2 minutes), CI re-runs and should pass.

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

See [Publishing](#publishing).

### Changelogs

Changesets writes per-package `CHANGELOG.md` files under `packages/*/` when you run `pnpm release:tag` (via `changeset version`). Consumers can read:

- GitHub Releases (summary from the action)
- `packages/mdcp-cli/CHANGELOG.md` (and core/presets) on the tag

### Supported versions

Security fixes target the **latest minor** on npm. See [SECURITY.md](SECURITY.md) for the supported-versions table — update that table when cutting a new minor line.

### Related docs

- [Publishing](#publishing) — first publish, Trusted Publishing, npm commands
- [.changeset/README.md](.changeset/README.md) — quick changeset reference

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

Trusted Publishing must reference workflow **`release.yml`** (trigger: **`v*` tags**). See [Versioning and releases](#versioning-and-releases).

### Trusted Publishing notes

- Repository: `betsalel-williamson/mdcp`, workflow: `release.yml`
- Revoke any legacy `NPM_TOKEN` secrets from GitHub once OIDC is verified
- The release workflow uses OIDC (`id-token: write`) and `NPM_CONFIG_PROVENANCE=true`

### Release workflow (NPM Packages)

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

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## domain glossary

Per-repository glossary shards under `docs/glossary/` for acronyms and product vocabulary. When legacy systems reuse the same term for different concepts, add a **disambiguation** entry and link from feature shards on first use. Start the glossary before large feature shards when migrating or onboarding new projects.

### One term per shard

Each definition lives in its own `.md` file with a single `#` heading (the term). Link the term from feature shards on first use, for example `[GFM](./gfm.md)` or `../glossary/gfm.md` from another guide.

### Multiple index files

When a glossary grows beyond a comfortable manifest size, group entries in sub-index manifests:

| File                | Role                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `index.md`          | Master index — preamble plus links to every term shard (required for cross-guide stitch) |
| `index-protocol.md` | Example sub-index — protocol-related terms only                                          |
| `index-format.md`   | Example sub-index — format and compile terms                                             |

**Stitched into other guides:** link `../glossary/index.md` from each guide `index.md`. Set `compile.scopeRoot` to `glossary` on those guides so transitive `.md` links from the glossary tree pull term shards into compile output without listing every term in the parent manifest.

**Standalone glossary output:** add `glossary` to `compileOrder` with `compile.outputFile` and optionally `compile.manifest: index-protocol.md` (or another sub-index) when you want a separate compiled glossary per group.

## Agent Skills

The successor to the legacy `mdcp.v*.llms.txt` (llms-index) bootstrap file. Instead of fetching a monolithic `llms.txt` file, MDCP is delivered as a portable Agent Skill (e.g., `.agents/skills/mdcp/SKILL.md`). This provides a host-agnostic, zero-friction way to enforce documentation guardrails, workflows, and complementary skills (like prompts and formats) across different AI coding assistants.

## MDCP

**MarkDown Context Protocol** — a protocol for repository documentation context: sharded intent and design in Markdown, validated compile output for agents, CI, and human readers. The CLI is one surface; `compile`, `check`, `refs lookup`, and `export --llm` implement the shared context layer.

## protocol version

Four-part version for MDCP **artifact and config compatibility** (default `0.4.0.0`). Declared in `mdcp.config.json` as `protocolVersion` and in `mdcp.v*.llms.txt` as the first-line header `mdcp-llms-index: 0.4.0.0`. Filename may abbreviate trailing `.0` segments (`mdcp.v0.4.llms.txt` ≡ `0.4.0.0`).

**Version history:** `0.4.0.0` is the first published llms-index spec (open alpha). Pre-0.4 compile and doc-authoring evolution is recorded in [package changelogs](https://github.com/betsalel-williamson/mdcp/blob/main/packages/mdcp-cli/CHANGELOG.md) and the [0.4.0 changesets](https://github.com/betsalel-williamson/mdcp/tree/main/.changeset/) — see [Versioning and releases](#040-open-alpha-milestone).

Protocol version is **not** npm semver. npm `@bwilliamson/mdcp-cli@0.4.1` implements this draft protocol profile while tooling remains pre-1.0. **`valpha`** is the open-alpha symlink; **`vstable`** is reserved for npm **1.0.0**.

## mdcp-llms-index

_Transitional / Legacy._ Previously the export profile for the versioned agent bootstrap file `mdcp.v*.llms.txt` in the docs root. This approach is being migrated to [Agent Skills](#agent-skills) to provide a more modular, host-agnostic delivery mechanism. During the migration, llms-index remains available but is no longer the primary agent entrypoint. Read [Vision and roadmap](docs/features/protocol/00-vision-and-roadmap.md).

## GFM

**GitHub Flavored Markdown** — standard Markdown plus GitHub extensions (tables, task lists, fenced code). Not Pandoc, LaTeX, or wikilinks.

## Authored GFM

Shard markdown as written before compile — no preprocessor substitution or template conditionals. Compile hooks may transform it during assembly; read [Preprocessor / templating (out of scope)](docs/features/design-constraints/preprocessor-templating.md#preprocessor--templating-out-of-scope).

## ignoreGuides

Guide names listed on the **compiling** guide under `compile.crossGuideLinks.ignoreGuides`. Cross-guide links to those guides keep source shard `.md` paths instead of rewriting to monolith `#slug` targets. Does not exclude the guide from `compileOrder` or the link index — only skips link rewrite for those targets. On publish outputs, [publish-relative rewrite](./packages/mdcp-core/README.md#publish-relative-link-rewriting) still rebases the shard path for the publish file. Read [Cross-guide link rewriting](./packages/mdcp-core/README.md#cross-guide-link-rewriting).

## WIIFM

**What's In It For Me** — reader-first benefit before mechanics or toolchain detail. On mdcp landing pages, each [adoption archetype](docs/features/personas-and-priority-tiers.md#adoption-archetypes) gets one WIIFM line; copy must follow [Benefit claims and evidence](docs/features/protocol/benefit-claims-and-evidence.md) tiers (Tier A/B on README, never unmeasured Tier C claims).
