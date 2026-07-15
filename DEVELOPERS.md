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

### Skill verification

- [skill content lint](#skill-content-lint)
- [live skill eval](#live-skill-eval)

### Format and compile terms

- [GFM](#gfm)
- [Authored GFM](#authored-gfm)
- [ignoreGuides](#ignoreguides)
- [refs](#refs)
- [refs registry](#refs-registry)
- [heading slug](#heading-slug)
- [cross-link](#cross-link)

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

If you use coding agents with task-type subagents ([skills/mdcp/agents/](skills/mdcp/agents)), document how to load tracker issues **once per repo**. This project maintains that in [Agent work-item tracking](#agent-work-item-tracking) — add it to your setup checklist alongside install and build steps. Consumer repos should add a similar shard under `docs/developer/` and link it from local setup.

### Daily commands

| Command                  | Purpose                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `pnpm build`             | Build all packages (`mdcp-core`, `mdcp-cli`)                             |
| `pnpm test`              | Run `vitest` in `mdcp-core`                                              |
| `pnpm run typecheck`     | TypeScript across packages                                               |
| `pnpm run lint`          | ESLint on TypeScript sources                                             |
| `pnpm run format:check`  | Prettier check                                                           |
| `pnpm run check`         | Full gate including skill:lint, skill:validate, and docs:check           |
| `pnpm skill:install`     | Dogfood-install parent skill from `skills/mdcp/` into `.agents/skills/`  |
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

How coding agents load tracker issues and delivery conventions **for this repository**. Task-type subagents in [skills/mdcp/agents/](skills/mdcp/agents) (also present under `.agents/skills/mdcp/agents/` after a local dogfood install) point here via `WORK_ITEM_LOOKUP`.

Configure an equivalent shard in consumer repos during [local setup](#local-setup).

### Tracker

```text
Host=GitHub (betsalel-williamson/mdcp)
Issue base URL=https://github.com/betsalel-williamson/mdcp/issues/
Project board=https://github.com/users/betsalel-williamson/projects/4
WORK_ITEM=enough to resolve the issue — number, URL, or short name/description
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
Release notes=changeset in .changeset/ for published package changes (temporary until versioned into CHANGELOGs)
Docs=describe current behavior only; removed or breaking behavior belongs in changeset → package CHANGELOG, not feature/client shards
ADRs=docs/features/adr/ (scope/removal decisions; link CHANGELOGs, never pending .changeset/*.md)
Code review=gh pr create; link WORK_ITEM in PR body (Closes #N when appropriate)
```

### Workflow best practices

1. **Load scope** — fetch WORK_ITEM (title, body, acceptance criteria) before planning or editing.
2. **Branch first** — `git checkout main`, pull, then `git checkout -b feature/...` tied to the issue. Never start on `main`.
3. **Stay focused** — one feature or design at a time. Treat acceptance criteria as the boundary unless WORK_ITEM explicitly expands scope.
4. **Docs describe now** — update shards to match as-built behavior. Do not document superseded workflows in `docs/features/` or `docs/client/`; record consumer notice in the changeset (lands in package CHANGELOGs). Never link durable shards or ADRs to pending `.changeset/*.md` files.

### Example intake answers

When a subagent asks for scope, answers can look like:

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=docs/developer/agent-work-item-tracking.md
```

```text
WORK_ITEM=default compile hooks
WORK_ITEM_LOOKUP=GitHub
```

`WORK_ITEM` may be an issue number, URL, or a short name/description the agent can resolve. `WORK_ITEM_LOOKUP` may be this shard path or a plain location (e.g. GitHub) that points the agent at the tracker conventions here. For subagent catalog and invoke recipe, read [`skills/mdcp/references/agents.md`](skills/mdcp/references/agents.md).

## Repository layout

```text
mdcp/
├── CODE_OF_CONDUCT.md      # Contributor Covenant (committed)
├── README.md               # Compiled from docs/repo-readme/ (committed)
├── DEVELOPERS.md           # Compiled from docs/developer/ (committed)
├── skills/                 # Publishable Agent Skills source (skills.sh layout)
│   ├── mdcp/               # Parent documentation-system skill
│   ├── mdcp-arch-oss-library/
│   └── mdcp-arch-product-docs-site/
├── skills.sh.json          # skills.sh repo page groupings
├── .agents/skills/         # Local dogfood installs + workspaces (gitignored publishable copies)
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
| Protocol helpers   | `src/export/`                 |
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
| `repo-readme/` | GitHub visitors, skill adopters  | `README.md` at repo root                          |

**Surface ownership:** `repo-readme/` = Agent Skill landing; `client-cli/` = CLI commands/config only; `client-core/` = library API/hooks only. Cross-link the other surfaces instead of duplicating skill, CLI, or API narrative across package READMEs.

Config: [`docs/mdcp.config.json`](docs/mdcp.config.json). Guides with `compile.outputFile` publish to a separate path and are **excluded** from the monolith.

Publish landing style for root README: [Personas and priority tiers](docs/features/personas-and-priority-tiers.md#publish-landing-style).

#### Agent Skill dogfood

Agent guidance for this repo is the parent **Agent Skill** under [`skills/mdcp/`](skills/mdcp). After editing skill files, refresh the local install:

```bash
pnpm skill:install
```

That copies `skills/mdcp/` into `.agents/skills/mdcp/` (gitignored). Manual invoke: `/mdcp`. See [Agent Skill](#agent-skill).

Shard `../` links in publish guides (`developer`, `client-cli`, `client-core`) rebase automatically at compile — resolve from each shard file to an absolute path, then emit a path relative to the publish output. No per-guide path-prefix config. See [Publish-relative link rewriting](./packages/mdcp-core/README.md#publish-relative-link-rewriting).

Repo scripts use `--config docs/mdcp.config.json --docs-root docs`: the config path is resolved from the **repo root** (invocation directory), while `--docs-root docs` sets the shard tree root. See [Config essentials — `--config` vs `--docs-root`](./packages/mdcp-cli/README.md#--config-vs---docs-root).

The **features** compile (`docs/_build/guides.md`) is for reading through the stitched doc during review — edit shards, not the generated file. It is not committed.

### Edit workflow

1. Edit shard `.md` files under the relevant guide directory.
2. If you changed a guide's `index.md` link order, re-run compile — order is read from the manifest. See [Manifest compile order](docs/features/manifest-compile-order.md) when using `compile.sectionsHeading`.
3. Run `pnpm docs:compile:repo` then `pnpm docs:check:repo`.
4. Commit shard changes. Regenerated `docs/_build/` (monolith, per-guide outputs, `.caches/refs.json`) is gitignored — CI and `pnpm docs:check` compile locally. Commit [`DEVELOPERS.md`](DEVELOPERS.md) when `developer/` shards change; commit [`README.md`](README.md) when `repo-readme/` shards change; commit package READMEs when `client-cli/` or `client-core/` shards change.

### Agent context

Prefer host search then read one shard under `docs/`. Compiled monoliths under `docs/_build/` are available when a broader read is intentional.

### Linting docs

- **markdownlint** — shard preset + compiled preset (includes `DEVELOPERS.md` and published README paths)
- **Vale** — prose lint on `glossary/`, `features/`, `developer/`, `client-cli/`, `client-core/`, `repo-readme/` (install [Vale](https://vale.sh/docs/vale-cli/installation/) on `PATH`; not an npm dependency)
- **xref lint** — `mdcp check` flags bare `Ch. N` and unlinked chapter references in shards
- **link lint** — built-in validation runs on every `docs:check` with default `"error"` severity; publish guides set `compile.crossGuideLinks.ignoreGuides: ["features"]` so cross-guide links keep live `docs/features/` shard paths (publish-relative rebase only); see [Publish-only link policy](docs/features/link-validation.md#publish-only-link-policy)

Run `pnpm vale:sync` after cloning or when `.vale.ini` changes (requires Vale on `PATH`).

## Markdown formatting

### Base Requirement

When contributing documentation, rely on **simple GFM (GitHub Flavored Markdown)** as the standard.

### We do not enforce OKF

We explicitly decided not to adopt OKF (One Knowledge Format) or any other highly opinionated, rigid document structure (see [ADR 0003](docs/features/adr/0003-do-not-adopt-okf.md)). The goal is to keep the authoring experience simple, flexible, and accessible. You do not need to adhere to complex metadata schemas or strict structural hierarchies when writing documentation shards.

### Strict Link Validity

While we are unopinionated about document structure, we are **strict about links**.

- All links in your documentation must be valid and point to existing files or headings.
- If a link is invalid, the CI and documentation checks will fail.
- Do not create links to files that do not exist yet. If you need to indicate a placeholder, comment it out or write `(TBD)`.

For more details on the link validation rules, please consult the [Format specification](docs/features/protocol/format-specification.md).

## Agent Skill

Zero-friction MDCP delivery for AI agents uses the portable **parent** Agent Skill. Upstream source of truth is [`skills/mdcp/SKILL.md`](skills/mdcp/SKILL.md). After install (or local dogfood), agents load it from `.agents/skills/mdcp/`. Complementary archetype skills under `skills/mdcp-arch-*` are **WIP**: they carry `metadata.internal: true` so the skills CLI hides them from default `--list` / public install prompts. Keep them out of consumer get-started docs and [`skills.sh.json`](skills.sh.json) until ready. Maintainers can surface them with `INSTALL_INTERNAL_SKILLS=1`.

### Local dogfood

Author under `skills/`. Then install into this repo for agents:

```bash
pnpm skill:install
```

That runs `npx skills add . --skill mdcp` and copies the parent skill into `.agents/skills/mdcp/`.

Installed copies under `.agents/skills/mdcp*` are gitignored so they do not duplicate upstream source. Manual invoke (hosts that support slash skills): `/mdcp`. First-time consumer bootstrap: `/mdcp help me get started`.

When changing skill instructions:

1. Edit `skills/mdcp/SKILL.md` (and `references/` as needed) — keep the activation body under 500 lines; put depth in `references/`.
2. Do **not** invent new protocol in the skill — CLI and schemas stay in packages.
3. For archetypes (WIP), edit `skills/mdcp-arch-*` instead of growing the parent forever — do not highlight them in consumer install docs yet.
4. Update [Agent Skill delivery](docs/features/agent-skill.md) when install or layout changes.
5. Run `pnpm skill:install` after skill edits so local agents pick up changes, then `pnpm skill:lint`, `pnpm skill:validate`, and `pnpm docs:check`.

### Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Current docs only:** Shards must describe the product **as it works now**. When behavior or guidance changes, remove superseded or stale text from durable docs — do not leave “old way” sections for archaeology. Git history preserves prior wording; consumer notice of breaking or removed behavior belongs in the **changeset** (folded into package CHANGELOGs at release), not in feature/client/developer shards. Never link durable shards or ADRs to pending `.changeset/*.md` files — those notes are temporary.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **Break it down:** Organize information into the smallest possible pieces (shards).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, incident logs, or migration backlogs and planning in the durable documentation. That information belongs in issue tracking and project planning tools. Pending `.changeset/*.md` files are temporary release notes — write them for the release pipeline; do not link them from ADRs or other durable docs.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

### Verification

| Command               | Purpose                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `pnpm skill:lint`     | MDCP content lint on parent `SKILL.md` (phrases, frontmatter, line budget)      |
| `pnpm skill:validate` | [skills-ref](https://agentskills.io/specification) validate on all three skills |
| `pnpm docs:check`     | Docs compile + lint gate after shard edits                                      |

Both skill gates run in local `pnpm check` and GitHub Actions CI. Neither is a [live skill eval](docs/glossary/live-skill-eval.md).

### Optional local improve loop

For qualitative description tuning and agent behavior checks, install Anthropic's `skill-creator` locally (`npx skills add anthropics/skills --skill skill-creator`) and use fixtures under `skills/mdcp/evals/`. That [live skill eval](docs/glossary/live-skill-eval.md) loop is local-only — do **not** require Claude CLI or `skill-creator` in CI.

### Publishing the skill pack

Ship `skills/mdcp/` as the consumer entrypoint. Complementary `skills/mdcp-arch-*` directories remain WIP (`metadata.internal: true`) — do not highlight them on get-started or skills.sh until ready. Prefer:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

There is no skills.sh submit API. The [repo page](https://skills.sh/betsalel-williamson/mdcp) appears from install telemetry after consumers (or maintainers) run the command above without `DISABLE_TELEMETRY=1`. Release tagging syncs `metadata.version` on all skills under `skills/` — see [Versioning and releases](#versioning-and-releases).

Documented consumer install path: `.agents/skills/`. Avoid Cursor-only or Marketplace-only packaging for this work.

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

**Agent Skills** live under `skills/` (not npm). They ship from Git via `npx skills add` into `.agents/skills/`. On each release, `pnpm release:tag` sets every `skills/*/SKILL.md` `metadata.version` to match the tag (other frontmatter such as `metadata.internal` is preserved). See [Agent Skill](#agent-skill).

Typical rhythm for an active dev project: **a few releases per month**, batched when there is something worth shipping — not on a fixed weekly/monthly schedule.

### Pre-1.0 policy (`0.x.y`)

The project is **pre-1.0** (open alpha). Until **1.0.0**, there is **no API stability guarantee** — exported library APIs, CLI commands and flags, `mdcp.config.json` schema, and compile output shape may change in any `0.x.y` release without a semver-major bump. Agent Skills (`npx skills add`) are the supported agent delivery path.

Treat versions as:

| Bump                     | When                                                                                | Examples                                                 |
| ------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **patch**                | Bug fixes, internal refactors with no intended API change                           | compile heading fix, orphan check false positive         |
| **minor**                | New commands, config fields, hooks, or behavior additions                           | new `mdcp` subcommand, new compile hook, new preset rule |
| **major** (within `0.x`) | Breaking CLI flags, config schema removals, output format changes consumers rely on | rename config key, change compiled heading rules         |

At **1.0.0**, semver applies strictly: breaking changes require a major bump. Graduate when core mechanics survive real-world adoption without breaking changes for several months.

#### Community feedback

- Visit [github.com/betsalel-williamson/mdcp](https://github.com/betsalel-williamson/mdcp) and **star** the repo to follow progress
- **Open an issue** or **comment on existing issues and PRs** with bugs, adoption stories, or protocol/tooling feedback
- Pin the current open-alpha CLI version from the root README and read changelogs before upgrading

### Release checklist (maintainers)

Use this for every cut. Do not accumulate one-off milestone checklists in this shard.

1. On clean `main`, confirm pending `.changeset/*.md` files cover package changes since the last tag.
2. **Skills policy:** only the parent `mdcp` skill is public. Keep complementary `skills/mdcp-arch-*` skills as `metadata.internal: true` until intentionally published; list only `mdcp` in [`skills.sh.json`](skills.sh.json).
3. Preflight: `pnpm skill:lint && pnpm skill:validate && pnpm check` (or at least `pnpm docs:check` when only docs/skills changed).
4. In a real TTY: `pnpm release:tag:push` — select bump (patch / minor / major / build), type `vX.Y.Z`, answer `yes`. Agents and CI cannot run this script.
5. The script applies changesets, bumps package versions and changelogs, syncs `skills/*/SKILL.md` `metadata.version`, commits `chore: release vX.Y.Z`, tags, and (with `--push`) pushes `main` + the tag.
6. Verify CI [release workflow](.github/workflows/release.yml): npm versions for all three packages and the GitHub Release for `vX.Y.Z`.
7. **skills.sh:** there is no registry submit. Listing at [skills.sh/betsalel-williamson/mdcp](https://skills.sh/betsalel-williamson/mdcp) comes from anonymous install telemetry. If the page is missing or stale after a skill-facing release, run `npx skills add betsalel-williamson/mdcp --skill mdcp` without `DISABLE_TELEMETRY=1`. Maintainers can list internal skills with `INSTALL_INTERNAL_SKILLS=1`.

Preview without writes: `pnpm release:tag --dry-run`.

### Durable docs vs pending changesets

Pending files under `.changeset/*.md` (other than `README.md`) are **temporary**: `pnpm release:tag` consumes them into package `CHANGELOG.md` files and deletes them. Do **not** link ADRs, feature, client, or developer narrative shards to those pending files. Point consumers at package CHANGELOGs or GitHub Releases instead. Linking `.changeset/config.json` or `.changeset/README.md` from developer release docs is fine — those are stable tooling references. `pnpm docs:check` runs `docs:lint:changeset-links` to enforce this.

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

Dependabot does not add changesets. Treat its PRs like any other:

| Dependabot PR type                                      | Changeset                                     |
| ------------------------------------------------------- | --------------------------------------------- |
| Production dependency bump in `packages/*/package.json` | Add a **patch** changeset before merge        |
| Root dev-dependencies (grouped) or GitHub Actions only  | No changeset (CI `changeset` job should pass) |

### Bump selection guide

When **adding** a changeset in a PR, pick the bump that best describes your change (the maintainer confirms the final bump at release):

| Your change                                                                 | Suggested bump         |
| --------------------------------------------------------------------------- | ---------------------- |
| Fixes incorrect output or validation                                        | **patch**              |
| Adds optional config or a new non-breaking command                          | **minor**              |
| Removes or renames config, changes compile output shape, drops Node support | **major**              |
| Republish without API change (CI, tooling, registry metadata)               | **build** (at release) |

At release, `pnpm release:tag` lets the maintainer choose **patch / minor / major / build** and requires typing the version plus an explicit `yes` — non-interactive tools cannot release.

#### Bump types (chosen at release time)

| Choice | Bump      | Use for                                                  |
| ------ | --------- | -------------------------------------------------------- |
| 1      | **patch** | Bug fixes, no intended API change                        |
| 2      | **minor** | New features, backward compatible                        |
| 3      | **major** | Breaking CLI, config, or compile output                  |
| 4      | **build** | Republish same API (`0.1.0-build.1`, `0.1.0-build.2`, …) |

#### Human confirmation gate

1. Select bump type `1`–`4`
2. Type the exact tag (e.g. `vX.Y.Z`) to confirm
3. Answer `yes` to “Do you really want to do this?”

Without a TTY, the script exits immediately.

#### Automated (after tag push)

1. CI checks out the tagged commit.
2. `pnpm build` then `pnpm changeset publish` with npm provenance (OIDC).
3. GitHub Release is created with generated release notes.

First-time npm Trusted Publishing and local fallback: [Publishing](#publishing).

### Changelogs

Changesets writes per-package `CHANGELOG.md` files under `packages/*/` when you run `pnpm release:tag` (via `changeset version`). Consumers can read:

- GitHub Releases (summary from the action)
- `packages/mdcp-cli/CHANGELOG.md` (and core/presets) on the tag

### Supported versions

Security fixes target the **latest minor** on npm. See [SECURITY.md](SECURITY.md) for the supported-versions table — update that table when cutting a new minor line.

### Related docs

- [Publishing](#publishing) — first publish, Trusted Publishing, npm commands
- [Agent Skill](#agent-skill) — skill pack, WIP `internal` flag, skills.sh
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

### Routine releases

For every cut after Trusted Publishing is configured, follow the **Release checklist** in [Versioning and releases](#versioning-and-releases) (`pnpm release:tag:push` on clean `main`). That checklist covers skills version sync, skills.sh telemetry, and npm verification.

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

| Use case       | Command                                                    |
| -------------- | ---------------------------------------------------------- |
| Dev dependency | `npm i -D @bwilliamson/mdcp-cli @bwilliamson/mdcp-presets` |
| Global CLI     | `npm i -g @bwilliamson/mdcp-cli`                           |
| Programmatic   | `import { compileGuides } from '@bwilliamson/mdcp-core'`   |

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

**Stitched into other guides:** link `../glossary/index.md` from each guide that should publish the full glossary TOC (typically maintainer guides). Lean consumer READMEs may omit the TOC and link individual terms instead. Set `compile.scopeRoot` to `glossary` on those guides so transitive `.md` links from the glossary tree pull term shards into compile output without listing every term in the parent manifest.

**Standalone glossary output:** add `glossary` to `compileOrder` with `compile.outputFile` and optionally `compile.manifest: index-protocol.md` (or another sub-index) when you want a separate compiled glossary per group.

## Agent Skills

Portable packages of agent instructions (`SKILL.md` and companions) that hosts discover and load — the delivery model for MDCP’s **documentation system** guardrails. Upstream source in this monorepo is `skills/mdcp/`; consumers vendor via `npx skills add` into `.agents/skills/mdcp/` so agents learn how to shard, compile, validate, and maintain docs one piece at a time — across Cursor, Copilot, Claude Code, and similar hosts.

Verification is split: [skill content lint](#skill-content-lint) (`pnpm skill:lint`) plus agentskills.io validation (`pnpm skill:validate` / skills-ref) in CI; [live skill eval](#live-skill-eval) is the optional local skill-creator loop.

## MDCP

**MarkDown Context Protocol** — a **documentation system** delivered as an [Agent Skill](#agent-skills) and lightweight toolchain. It helps teams who care about durable docs distill mind maps, architecture notes, specs, and product ideas into small Markdown **shards** so intent stays reviewable in git, maintainable as ideas keep arriving, and readable one shard at a time by people and coding agents.

MDCP is not a magic bullet for documentation debt. It is a practice and skill that puts system context where it compounds — tracing why the software exists, how to use it, and what value it delivers — for a team of one or a full product, engineering, and marketing org.

The CLI (`compile`, `check`, and [refs](#refs) registry maintenance) implements that shared context layer alongside the skill’s behavioral guardrails.

## protocol version

Optional four-part string for MDCP **artifact and config compatibility** (historically default `0.4.0.0`). Declared in `mdcp.config.json` as `protocolVersion` when present.

Prefer [Agent Skills](#agent-skills) for agent delivery. This config field is not an agent bootstrap path.

Protocol version is **not** npm semver. npm `@bwilliamson/mdcp-cli` remains pre-1.0 while tooling and agent delivery continue to evolve.

## skill content lint

CI/static check that required or forbidden language still appears in the parent `SKILL.md` (plus frontmatter and line-budget rules). Run with `pnpm skill:lint` against `skills/mdcp/SKILL.md`; fixtures live under `scripts/mdcp-skill-content-lint/` (repo CI assets — not part of the portable skill pack). This is substring analysis of Markdown on disk — **not** a [live skill eval](#live-skill-eval), and it does not run agents or measure triggering.

Companion gate: `pnpm skill:validate` runs [skills-ref](https://agentskills.io/specification) on each publishable skill under `skills/`.

## live skill eval

Optional local skill-creator workflow: run agents with the skill, grade outputs, and optimize description triggering. Fixtures for that loop live under `skills/mdcp/evals/`. Never a CI gate in this repository — contrast with [skill content lint](#skill-content-lint), which only checks that phrases exist in `SKILL.md`.

## GFM

**GitHub Flavored Markdown** — standard Markdown plus GitHub extensions (tables, task lists, fenced code). Not Pandoc, LaTeX, or wikilinks.

## Authored GFM

Shard markdown as written before compile — no preprocessor substitution or template conditionals. Compile hooks may transform it during assembly; read [Preprocessor / templating (out of scope)](docs/features/design-constraints/preprocessor-templating.md#preprocessor--templating-out-of-scope).

## ignoreGuides

Guide names listed on the **compiling** guide under `compile.crossGuideLinks.ignoreGuides`. Cross-guide links to those guides keep source shard `.md` paths instead of rewriting to monolith `#slug` targets. Does not exclude the guide from `compileOrder` or the link index — only skips link rewrite for those targets. On publish outputs, [publish-relative rewrite](./packages/mdcp-core/README.md#publish-relative-link-rewriting) still rebases the shard path for the publish file. Read [Cross-guide link rewriting](./packages/mdcp-core/README.md#cross-guide-link-rewriting).

## refs

**Refs** (short for **references**) are the organized set of heading [slugs](#heading-slug) and [cross-links](#cross-link) MDCP derives from compiled guides so authors and CI can keep Markdown links coherent after stitch.

The problem refs solve is structural, not retrieval: shards merge, heading levels shift, and duplicate titles get disambiguated — so a hand-guessed `#anchor` or stale path can break after `compile`. MDCP keeps a [refs registry](#refs-registry) and validates links at `check` time so the **compiled** document still targets the right sections and files.

### Related wording

| Form               | Meaning                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| **refs** (noun)    | The reference system as a whole (slugs + links + registry)                        |
| **refs registry**  | Derived catalog (`refs.json`) of compiled heading entries                         |
| **ref** (informal) | One heading entry or one link target under that system                            |
| **generate refs**  | Rebuild the registry from compiled output (`mdcp refs gen` / compile side effect) |
| **list refs**      | Print registry headings (`mdcp refs list`)                                        |
| **check refs**     | Confirm registry matches compiled headings (`mdcp refs check` / via `mdcp check`) |

Doc discovery uses host search (`rg`, IDE search, or a future MCP index). Cross-link correctness uses **`mdcp check`** and optionally **`mdcp refs list`**. Refs are not a retrieval API — see [ADR 0002](docs/features/adr/0002-remove-refs-lookup.md).

Not the same as ordinary “search the docs.” Refs are about **correct anchors and paths after compile**.

## refs registry

Derived catalog of [heading slugs](#heading-slug) from compiled guide output, typically written as `refs.json` under `outputDir`. Parent concept: [refs](#refs).

The registry is **generated state**, not authored shards. `mdcp compile` (and `mdcp refs gen`) rebuild it; `mdcp check` / `mdcp refs check` verify it still matches the latest compile. Path rules: [Refs registry path](docs/features/refs-registry-path.md).

## heading slug

GitHub-style fragment id for a heading in **compiled** Markdown (the part after `#` in `[label](#slug)`). Parent concept: [refs](#refs).

MDCP computes slugs from final heading text after guides are stitched and demoted — same rules GitHub uses for README anchors (via `github-slugger`). Duplicate titles in one document get `-1`, `-2` suffixes. Authors should not invent fragments from shard-only titles; [cross-links](#cross-link) must match the compiled slug, and `mdcp check` fails when they do not.

## cross-link

A Markdown link whose target is another place in the docs set — usually a same-document `[label](#heading-slug)` fragment, or a path to another shard/guide that compile may rewrite.

Cross-links are why [refs](#refs) exist: after assemble, the visible heading text and level can change, so the [heading slug](#heading-slug) that works in a shard may differ from the slug in the compiled file. MDCP rewrites and validates these targets so published and monolith outputs keep working links. See [Built-in link validation](docs/features/link-validation.md).

## WIIFM

**What's In It For Me** — reader-first benefit before mechanics or toolchain detail. On mdcp landing pages, each [adoption archetype](docs/features/personas-and-priority-tiers.md#adoption-archetypes) gets one WIIFM line; copy must follow [Benefit claims and evidence](docs/features/protocol/benefit-claims-and-evidence.md) tiers (Tier A/B on README, never unmeasured Tier C claims).
