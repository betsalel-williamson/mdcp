# Versioning and releases

mdcp uses [Semantic Versioning 2.0.0](https://semver.org/) and [Changesets](https://github.com/changesets/changesets) for predictable npm releases. All three published packages share one version number.

| Package      | npm name                    |
| ------------ | --------------------------- |
| CLI          | `@bwilliamson/mdcp-cli`     |
| Core library | `@bwilliamson/mdcp-core`    |
| Lint presets | `@bwilliamson/mdcp-presets` |

Fixed versioning is configured in [`.changeset/config.json`](../../.changeset/config.json) — bump one, bump all.

## Release schedule (lightweight)

There is **no calendar cadence**. Releases are **event-driven**:

1. Contributors add a changeset with each PR that affects published behavior.
2. Changes accumulate on `main`.
3. When ready, a maintainer runs **`pnpm release:tag:push`** to version, tag, and push.
4. CI publishes to npm when the **`v*`** tag lands on GitHub.

**Note on Agent Skills:** Publishable skills live under `skills/` (not npm). They evolve on `main` and are tagged with npm releases (e.g., `v0.4.1`). Bump each skill’s `metadata.version` with that release. Consumers install via Git (`npx skills add`) into `.agents/skills/`.

Typical rhythm for an active dev project: **a few releases per month**, batched when there is something worth shipping — not on a fixed weekly/monthly schedule.

## Pre-1.0 policy (`0.x.y`)

The project is **pre-1.0**. Until **1.0.0**, there is **no API stability guarantee** — exported library APIs, CLI commands and flags, `mdcp.config.json` schema, and compile output shape may change in any `0.x.y` release without a semver-major bump.

Treat versions as:

| Bump                     | When                                                                                | Examples                                                 |
| ------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **patch**                | Bug fixes, internal refactors with no intended API change                           | compile heading fix, orphan check false positive         |
| **minor**                | New commands, config fields, hooks, or behavior additions                           | new `mdcp` subcommand, new compile hook, new preset rule |
| **major** (within `0.x`) | Breaking CLI flags, config schema removals, output format changes consumers rely on | rename config key, change compiled heading rules         |

At **1.0.0**, semver applies strictly: breaking changes require a major bump.

## 0.4.0 open alpha milestone

**0.4.0** is the first public alpha for external testers. It shipped compile/check, built-in link validation, cross-guide link assembly, sharded glossary support, and unified output layout — with breaking changes since 0.3.0 allowed under pre-1.0 policy. Agent Skills are the supported agent delivery path (`npx skills add`).

| Track              | 0.4.0 status                                                           |
| ------------------ | ---------------------------------------------------------------------- |
| **npm packages**   | Open alpha — pin `@bwilliamson/mdcp-cli@0.4.0`; no stability guarantee |
| **Agent delivery** | Prefer Agent Skills (`npx skills add`)                                 |

**Pre-0.4 doc-style evolution:** npm **0.1.0–0.3.0** changes are in [package changelogs](https://github.com/betsalel-williamson/mdcp/blob/main/packages/mdcp-cli/CHANGELOG.md). The **0.4.0** batch (link validation, output layout, glossary manifest, etc.) is recorded in pending [.changeset/](https://github.com/betsalel-williamson/mdcp/tree/main/.changeset/) files — merged into `packages/*/CHANGELOG.md` at release.

**Roadmap V1 phase:** Reference implementation shipped; not a semver 1.0 stability promise.

**Path to 1.0.0:** npm graduates when the core mechanics survive real-world adoption without breaking changes for several months. Until then, iterate in `0.5.x` as feedback arrives.

### Community feedback

- Visit [github.com/betsalel-williamson/mdcp](https://github.com/betsalel-williamson/mdcp) and **star** the repo to follow progress
- **Open an issue** or **comment on existing issues and PRs** with bugs, adoption stories, or protocol/tooling feedback
- Pin `@bwilliamson/mdcp-cli@0.4.0` and read changelogs before upgrading

### Open alpha (0.4.0) release checklist

Completed for the **0.4.0** open alpha (historical — agent delivery has since moved to Agent Skills):

- [x] Open alpha npm tag and consumer install docs
- [x] `skills/mdcp` parent skill as agent entrypoint

### Open alpha (0.4.1) patch release checklist

Pending for **0.4.1** (first patch after 0.4.0 open alpha):

- [x] Agent Skill install docs (`npx skills add betsalel-williamson/mdcp --skill mdcp`)
- [ ] **Pending changesets** on `main` — merge and release as needed
- [ ] **`pnpm release:tag:push`** — human runs interactively; select **patch** → `v0.4.1`

## When to add a changeset

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

## Dependabot

Dependabot does not add changesets. [`.github/workflows/dependabot-changeset.yml`](../../.github/workflows/dependabot-changeset.yml) runs on Dependabot PRs and commits a **patch** changeset for all three fixed packages when a published package's production dependencies change (`dependencies`, `peerDependencies`, `optionalDependencies`).

| Dependabot PR type                                      | Changeset                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| Production dependency bump in `packages/*/package.json` | Auto **patch** changeset (`.changeset/dependabot-<pr>.md`) |
| Root dev-dependencies (grouped) or GitHub Actions only  | No changeset (workflow no-ops; CI passes)                  |

**One-time setup:** add repository secret `DEPENDENCY_UPDATE_GITHUB_TOKEN` — a fine-grained or classic PAT with **Contents: read/write** on this repo. The default `GITHUB_TOKEN` cannot push in a way that re-triggers CI on Dependabot branches; the PAT does.

**Timing:** the first CI run on a new Dependabot PR may fail the `changeset` job briefly. After the workflow commits the changeset (usually within 1–2 minutes), CI re-runs and should pass.

## Bump selection guide

When **adding** a changeset in a PR, pick the bump that best describes your change (the maintainer confirms the final bump at release):

| Your change                                                                 | Suggested bump         |
| --------------------------------------------------------------------------- | ---------------------- |
| Fixes incorrect output or validation                                        | **patch**              |
| Adds optional config or a new non-breaking command                          | **minor**              |
| Removes or renames config, changes compile output shape, drops Node support | **major**              |
| Republish without API change (CI, tooling, registry metadata)               | **build** (at release) |

At release, `pnpm release:tag` lets the maintainer choose **patch / minor / major / build** and requires typing the version plus an explicit `yes` — non-interactive tools cannot release.

## Release flow (maintainers)

### Day-to-day

```bash
pnpm changeset          # interactive; commit the new .changeset/*.md file
```

### Verify locally (optional)

```bash
pnpm changeset:status   # fails if package changes since the PR/upstream base lack a changeset
```

### Tag and publish (maintainers)

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

### Bump types (chosen at release time)

| Choice | Bump      | Use for                                                  |
| ------ | --------- | -------------------------------------------------------- |
| 1      | **patch** | Bug fixes, no intended API change                        |
| 2      | **minor** | New features, backward compatible                        |
| 3      | **major** | Breaking CLI, config, or compile output                  |
| 4      | **build** | Republish same API (`0.1.0-build.1`, `0.1.0-build.2`, …) |

### Human confirmation gate

1. Select bump type `1`–`4`
2. Type the exact tag (e.g. `v0.2.0`) to confirm
3. Answer `yes` to “Do you really want to do this?”

Without a TTY, the script exits immediately.

The [release workflow](../../.github/workflows/release.yml) runs on **`v*` tag push**, verifies the tag matches `packages/mdcp-cli/package.json` version, builds, runs `changeset publish`, and opens a GitHub Release.

### Automated (after tag push)

1. CI checks out the tagged commit.
2. `pnpm build` then `pnpm changeset publish` with npm provenance (OIDC).
3. GitHub Release is created with generated release notes.

### Manual fallback

See [Publishing](./publishing.md).

## Changelogs

Changesets writes per-package `CHANGELOG.md` files under `packages/*/` when you run `pnpm release:tag` (via `changeset version`). Consumers can read:

- GitHub Releases (summary from the action)
- `packages/mdcp-cli/CHANGELOG.md` (and core/presets) on the tag

## Supported versions

Security fixes target the **latest minor** on npm. See [SECURITY.md](../../SECURITY.md) for the supported-versions table — update that table when cutting a new minor line.

## Related docs

- [Publishing](./publishing.md) — first publish, Trusted Publishing, npm commands
- [.changeset/README.md](../../.changeset/README.md) — quick changeset reference
