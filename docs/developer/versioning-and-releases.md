# Versioning and releases

mdcp uses [Semantic Versioning 2.0.0](https://semver.org/) and [Changesets](https://github.com/changesets/changesets) for predictable releases. **Each npm package and each Agent Skill versions independently** — a changeset only bumps the items it lists.

| Item        | Identifier                  | Published to                                                       |
| ----------- | --------------------------- | ------------------------------------------------------------------ |
| CLI         | `@bwilliamson/mdcp-cli`     | npm + GitHub Release                                               |
| Core        | `@bwilliamson/mdcp-core`    | npm + GitHub Release                                               |
| Presets     | `@bwilliamson/mdcp-presets` | npm + GitHub Release                                               |
| Agent Skill | `@bwilliamson/skill-<id>`   | GitHub Release only (private carrier under `packages/skill-<id>/`) |

Independent versioning is configured in [`.changeset/config.json`](../../.changeset/config.json) (`fixed` is empty). Dependents of a bumped workspace package still get a **patch** internal dependency update (`updateInternalDependencies`).

## Release schedule (single step on `main`)

There is **no calendar cadence** and **no Version Packages PR**. Releases are **one CI job** after merge to `main`:

1. Contributors add a changeset with each PR that affects a published package or skill.
2. Merging that PR to `main` runs the [release workflow](../../.github/workflows/release.yml) (`pnpm release:main`).
3. After the **Release plan** job posts pending changesets (and any **missing GitHub Releases**) to the run summary, approve the **`release` environment**. CI then **sequentially**: applies changesets → syncs skill `metadata.version` → builds (so husky can run) → commits `chore: release` → **pushes to `main`** → publishes public packages to npm → **pushes tags** → creates GitHub Releases (including skill carriers).

If a prior run versioned/published but failed before Releases finished, the next Release plan detects **missing** `name@version` Releases and the release job **heals** them without bumping versions again (`gh release create … --target`).

**Agent Skills** live under `skills/` as the install surface (`npx skills add`). Version carriers and CHANGELOGs live under **`packages/skill-<id>/`** only — never under `skills/` (those files would pollute agent context on install). `pnpm release:main` syncs the carrier version into `skills/<id>/SKILL.md` `metadata.version`. Feature PRs must add a changeset targeting `@bwilliamson/skill-<id>` and must **not** hand-bump `metadata.version`. See [Agent Skill](./agent-skill.md).

## Pre-1.0 policy (`0.x.y`)

The project is **pre-1.0** (open alpha). Until **1.0.0**, there is **no API stability guarantee**. **Major bumps are disabled** (`pnpm changeset:reject-major`). Use **patch**, **minor** (including breaking-within-0.x), or **build** via `pnpm release:build`.

| Bump      | When                                                                       |
| --------- | -------------------------------------------------------------------------- |
| **patch** | Bug fixes, internal refactors with no intended API change                  |
| **minor** | New capabilities, or breaking-within-0.x until majors are opened           |
| **build** | Republish without API change (`0.1.0-build.1`, …) via `pnpm release:build` |

### Community feedback

- Visit [github.com/betsalel-williamson/mdcp](https://github.com/betsalel-williamson/mdcp) and **star** the repo
- **Open an issue** or comment on PRs with bugs, adoption stories, or tooling feedback

## Release checklist (maintainers)

1. Confirm pending `.changeset/*.md` files name only the packages/skills that should bump.
2. **Skills policy:** parent `mdcp` remains the consumer entrypoint; keep `skills/mdcp-arch-*` as `metadata.internal: true` until intentionally published (see [Agent Skill development](./agent-skill.md#skillsshjson-repo-page-layout)).
3. Ensure secret **`RELEASE_GITHUB_TOKEN`** is set (maintainer PAT with Contents + metadata for releases/push) — see [Publishing](./publishing.md).
4. Merge feature PRs to `main`. Approve the **`release` environment** deployment when prompted.
5. Verify GitHub Releases for each bumped item (npm packages and `@bwilliamson/skill-*`) and npm for public packages.

## Durable docs vs pending changesets

Pending `.changeset/*.md` files are temporary. Point consumers at package CHANGELOGs under `packages/*/` or GitHub Releases — never at pending changesets. Skill CHANGELOGs live under `packages/skill-<id>/CHANGELOG.md`, not under `skills/`.

## When to add a changeset

Run `pnpm changeset` when a PR changes:

- `packages/mdcp-core/src/**` → `@bwilliamson/mdcp-core`
- `packages/mdcp-cli/src/**` → `@bwilliamson/mdcp-cli`
- `packages/mdcp-presets/*.jsonc` → `@bwilliamson/mdcp-presets`
- **`skills/<id>/**`** → `@bwilliamson/skill-<id>` (carrier under `packages/skill-<id>/`)

**Do not** put `package.json` or `CHANGELOG.md` under `skills/`. **Do not** hand-edit `skills/*/SKILL.md` `metadata.version`.

CI runs `pnpm changeset:reject-major` and `pnpm changeset:status` on pull requests.

## Dependabot

| Dependabot PR type                        | Changeset / merge gate                                |
| ----------------------------------------- | ----------------------------------------------------- |
| Runtime deps in `packages/*/package.json` | **Human approval** + **patch** changeset before merge |
| `devDependencies` only, or GitHub Actions | No changeset                                          |

## Related docs

- [Publishing](./publishing.md)
- [Agent Skill](./agent-skill.md)
- [.changeset/README.md](../../.changeset/README.md)
