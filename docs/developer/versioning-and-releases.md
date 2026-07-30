# Versioning and releases

mdcp uses [Semantic Versioning 2.0.0](https://semver.org/) and [Changesets](https://github.com/changesets/changesets) for predictable releases. **Each npm package and each Agent Skill versions independently** — a changeset only bumps the items it lists.

| Item         | Identifier                          | Published to                  |
| ------------ | ----------------------------------- | ----------------------------- |
| CLI          | `@bwilliamson/mdcp-cli`             | npm                           |
| Core library | `@bwilliamson/mdcp-core`            | npm                           |
| Lint presets | `@bwilliamson/mdcp-presets`         | npm                           |
| Agent Skill  | `@bwilliamson/skill-<id>` (private) | Git (`skills/<id>/`; not npm) |

Independent versioning is configured in [`.changeset/config.json`](../../.changeset/config.json) (`fixed` is empty). Dependents of a bumped workspace package still get a **patch** internal dependency update (`updateInternalDependencies`).

## Release schedule (lightweight)

There is **no calendar cadence**. Releases are **event-driven on `main`**:

1. Contributors add a changeset with each PR that affects a published package or skill.
2. Merging the feature PR to `main` runs the [release workflow](../../.github/workflows/release.yml).
3. If pending changesets exist, CI opens or updates a **Version Packages** PR (applies bumps, changelogs, and skill frontmatter sync).
4. Merging that Version Packages PR to `main` publishes any public packages that were bumped (`pnpm release:publish`) and creates GitHub Releases for them.

**Agent Skills** live under `skills/` (not npm). Each skill has a private workspace `package.json` (`@bwilliamson/skill-<id>`) that Changesets versions. After `changeset version`, `pnpm release:version` syncs that version into `skills/<id>/SKILL.md` `metadata.version` (other frontmatter such as `metadata.internal` is preserved). Feature PRs that change a skill must add a changeset targeting **that skill package** and must **not** hand-bump `metadata.version`. See [Agent Skill](./agent-skill.md).

Typical rhythm for an active project: **ship when something is worth releasing** — often soon after the Version Packages PR is green — not on a fixed weekly/monthly schedule.

## Pre-1.0 policy (`0.x.y`)

The project is **pre-1.0** (open alpha). Until **1.0.0**, there is **no API stability guarantee** — exported library APIs, CLI commands and flags, `mdcp.config.json` schema, and compile output shape may change in any `0.x.y` release without a semver-major bump. Agent Skills (`npx skills add`) are the supported agent delivery path.

**Major bumps are disabled** in pending changesets until maintainers explicitly open majors / 1.0. CI runs `pnpm changeset:reject-major`. Use:

| Bump      | When                                                                               | Examples                                                |
| --------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **patch** | Bug fixes, internal refactors with no intended API change                          | compile heading fix, orphan check false positive        |
| **minor** | New commands, config fields, hooks, behavior additions, **or breaking-within-0.x** | new subcommand; rename config key (still minor pre-1.0) |
| **build** | Republish without API change (`0.1.0-build.1`, …) via `pnpm release:build`         | registry metadata / CI-only republish                   |

At **1.0.0**, semver applies strictly: breaking changes require a major bump (and the reject-major gate is lifted). Graduate when core mechanics survive real-world adoption without breaking changes for several months.

### Community feedback

- Visit [github.com/betsalel-williamson/mdcp](https://github.com/betsalel-williamson/mdcp) and **star** the repo to follow progress
- **Open an issue** or **comment on existing issues and PRs** with bugs, adoption stories, or protocol/tooling feedback
- Pin the current open-alpha CLI version from the root README and read changelogs before upgrading

## Release checklist (maintainers)

Use this for every cut. Do not accumulate one-off milestone checklists in this shard.

1. Confirm pending `.changeset/*.md` files name only the packages/skills that should bump (no drive-by majors).
2. **Skills policy:** parent `mdcp` remains the consumer entrypoint. Keep complementary `skills/mdcp-arch-*` skills as `metadata.internal: true` and **out** of [`skills.sh.json`](../../skills.sh.json) until intentionally published. List parent + release-ready helpers in the **Documentation system** grouping (see [Agent Skill development — skills.sh.json](./agent-skill.md#skillsshjson-repo-page-layout)).
3. Merge feature pull requests to `main`. Wait for the **Version Packages** PR from the release workflow. If Release fails with _GitHub Actions is not permitted to create or approve pull requests_, enable that checkbox under **Settings → Actions → General → Workflow permissions** (see [Publishing](./publishing.md)).
4. Review that PR: only intended packages/skills bumped; skill `metadata.version` matches carrier `package.json`; `pnpm skill:validate` already ran in `release:version`.
5. Merge the Version Packages PR. CI publishes bumped public packages (npm OIDC) and creates GitHub Releases. Private skill carriers are versioned in git only. The release job runs `pnpm build` before versioning so husky pre-commit still runs on the bot version commit (same protection as a local built tree).
6. **skills.sh:** there is no registry submit. Listing at [skills.sh/betsalel-williamson/mdcp](https://skills.sh/betsalel-williamson/mdcp) comes from anonymous install telemetry. If the page is missing or stale after a skill-facing release, run `npx skills add betsalel-williamson/mdcp --skill mdcp` without `DISABLE_TELEMETRY=1`. Maintainers can list internal skills with `INSTALL_INTERNAL_SKILLS=1`.

**Build republish** (no changeset): `pnpm release:build --packages mdcp-cli --skills mdcp` then commit and tag/publish as needed (or use `workflow_dispatch` on the release workflow after pushing the bump).

Preview versioning locally: `pnpm release:version` on a throwaway branch (consumes changesets).

## Durable docs vs pending changesets

Pending files under `.changeset/*.md` (other than `README.md`) are **temporary**: the Version Packages step consumes them into package/skill `CHANGELOG.md` files and deletes them. Do **not** link ADRs, feature, client, or developer narrative shards to those pending files. Point consumers at package CHANGELOGs or GitHub Releases instead. Linking `.changeset/config.json` or `.changeset/README.md` from developer release docs is fine — those are stable tooling references. `pnpm docs:check` runs `docs:lint:changeset-links` to enforce this.

## When to add a changeset

Run `pnpm changeset` and commit the generated file under `.changeset/` when a PR changes:

- `packages/mdcp-core/src/**` → bump `@bwilliamson/mdcp-core`
- `packages/mdcp-cli/src/**` → bump `@bwilliamson/mdcp-cli`
- `packages/mdcp-presets/*.jsonc` → bump `@bwilliamson/mdcp-presets`
- Published package `package.json` metadata consumers depend on → that package
- **`skills/<id>/**`** → bump `@bwilliamson/skill-<id>` (and only other packages if their published behavior also changed)

**Do not hand-edit** `skills/*/SKILL.md` `metadata.version` or skill `package.json` `version` in feature PRs. `pnpm release:version` owns those fields.

**Skip a changeset** for:

- Root `README.md`, `docs/`, `examples/` only (when the PR does **not** change `skills/` or published package sources)
- CI, Husky, or other tooling that does not change skill packs or npm package behavior
- `devDependencies` bumps in root or `packages/*/package.json` (including `@types/*`) when no other package fields or sources change
- Typo fixes in package READMEs with no behavior change (maintainer discretion)

CI on pull requests runs `pnpm changeset:reject-major` and `pnpm changeset:status` to catch missing changesets when **package sources** or **`skills/`** changed. Package-level `devDependencies`-only bumps are treated as tooling and do not fail the check.

## Dependabot

Dependabot does not add changesets. **Non-dev dependency bumps need a human** — review the PR, add a changeset, then merge. Dev-only bumps should pass CI without one.

| Dependabot PR type                                                                         | Changeset / merge gate                                |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `dependencies`, `peerDependencies`, or `optionalDependencies` in `packages/*/package.json` | **Human approval** + **patch** changeset before merge |
| `devDependencies` only (root and/or `packages/*/package.json`), or GitHub Actions          | No changeset (CI `changeset` job should pass)         |

## Bump selection guide

When **adding** a changeset in a PR, pick the bump for **each** affected package/skill:

| Your change                                                                 | Suggested bump                      |
| --------------------------------------------------------------------------- | ----------------------------------- |
| Fixes incorrect output or validation                                        | **patch**                           |
| Adds optional config or a new non-breaking command                          | **minor**                           |
| Removes or renames config, changes compile output shape, drops Node support | **minor** (pre-1.0; majors blocked) |
| Republish without API change (CI, tooling, registry metadata)               | **build** via `pnpm release:build`  |

### Automated (after Version Packages merges to main)

1. CI checks out `main` with the version commit.
2. `pnpm release:publish` builds, validates skills, then `changeset publish` with npm provenance (OIDC).
3. GitHub Releases are created for published public packages.

First-time npm Trusted Publishing and local fallback: [Publishing](./publishing.md).

## Changelogs

Changesets writes per-package `CHANGELOG.md` files under `packages/*/` and `skills/*/` when the Version Packages PR runs (`changeset version`). Consumers can read:

- GitHub Releases (for npm packages)
- `packages/mdcp-cli/CHANGELOG.md` (and core/presets) on the release commit
- `skills/<id>/CHANGELOG.md` for skill-only notes

## Supported versions

Security fixes target the **latest minor** of each affected package on npm. See [SECURITY.md](../../SECURITY.md) for the supported-versions table — update that table when cutting a new minor line. After a security patch ships, follow [Security-incident triage](./security-incident-triage.md) when deciding whether to `npm deprecate` (or rarely unpublish) a bad version.

## Related docs

- [Publishing](./publishing.md) — first publish, Trusted Publishing, npm commands
- [Security-incident triage](./security-incident-triage.md) — audit impact class, deprecate vs unpublish
- [Agent Skill](./agent-skill.md) — skill pack, WIP `internal` flag, skills.sh
- [.changeset/README.md](../../.changeset/README.md) — quick changeset reference
