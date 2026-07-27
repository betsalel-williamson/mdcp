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

**Agent Skills** live under `skills/` (not npm). They ship from Git via `npx skills add` into `.agents/skills/`. On each release, `pnpm release:tag` sets every `skills/*/SKILL.md` `metadata.version` to match the tag (other frontmatter such as `metadata.internal` is preserved). Feature PRs that change `skills/` must add a changeset and must **not** hand-bump those versions. See [Agent Skill](./agent-skill.md).

Typical rhythm for an active dev project: **a few releases per month**, batched when there is something worth shipping — not on a fixed weekly/monthly schedule.

## Pre-1.0 policy (`0.x.y`)

The project is **pre-1.0** (open alpha). Until **1.0.0**, there is **no API stability guarantee** — exported library APIs, CLI commands and flags, `mdcp.config.json` schema, and compile output shape may change in any `0.x.y` release without a semver-major bump. Agent Skills (`npx skills add`) are the supported agent delivery path.

Treat versions as:

| Bump                     | When                                                                                | Examples                                                 |
| ------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **patch**                | Bug fixes, internal refactors with no intended API change                           | compile heading fix, orphan check false positive         |
| **minor**                | New commands, config fields, hooks, or behavior additions                           | new `mdcp` subcommand, new compile hook, new preset rule |
| **major** (within `0.x`) | Breaking CLI flags, config schema removals, output format changes consumers rely on | rename config key, change compiled heading rules         |

At **1.0.0**, semver applies strictly: breaking changes require a major bump. Graduate when core mechanics survive real-world adoption without breaking changes for several months.

### Community feedback

- Visit [github.com/betsalel-williamson/mdcp](https://github.com/betsalel-williamson/mdcp) and **star** the repo to follow progress
- **Open an issue** or **comment on existing issues and PRs** with bugs, adoption stories, or protocol/tooling feedback
- Pin the current open-alpha CLI version from the root README and read changelogs before upgrading

## Release checklist (maintainers)

Use this for every cut. Do not accumulate one-off milestone checklists in this shard.

1. On clean `main`, confirm pending `.changeset/*.md` files cover package changes since the last tag.
2. **Skills policy:** parent `mdcp` remains the consumer entrypoint. Keep complementary `skills/mdcp-arch-*` skills as `metadata.internal: true` and **out** of [`skills.sh.json`](../../skills.sh.json) until intentionally published. List parent + release-ready helpers in the **Documentation system** grouping (see [Agent Skill development — skills.sh.json](./agent-skill.md#skillsshjson-repo-page-layout)).
3. Preflight: `pnpm skill:validate && pnpm check` (or at least `pnpm docs:check` when only docs/skills changed).
4. In a real TTY: `pnpm release:tag:push` — select bump (patch / minor / major / build), type `vX.Y.Z`, answer `yes`. Agents and CI cannot run this script.
5. The script applies changesets, bumps package versions and changelogs, syncs `skills/*/SKILL.md` `metadata.version`, then **must** run `pnpm skill:validate` (hard fail if invalid — including broken YAML fences like `---name:`). Only after that succeeds does it commit `chore: release vX.Y.Z`, tag, and (with `--push`) push `main` + the tag.
6. Verify CI [release workflow](../../.github/workflows/release.yml): it runs `pnpm skill:validate` again before npm publish, then publishes all three packages and creates the GitHub Release for `vX.Y.Z`.
7. **skills.sh:** there is no registry submit. Listing at [skills.sh/betsalel-williamson/mdcp](https://skills.sh/betsalel-williamson/mdcp) comes from anonymous install telemetry. If the page is missing or stale after a skill-facing release, run `npx skills add betsalel-williamson/mdcp --skill mdcp` without `DISABLE_TELEMETRY=1`. Maintainers can list internal skills with `INSTALL_INTERNAL_SKILLS=1`.
8. **skills.sh partner audits:** after a skill-facing release, partner re-audits on skills.sh typically land within minutes to about a day. Releases are not gated on audit readiness. The daily sync job (~20–28h after release) pulls published audits through the Vercel proxy; see [skills.sh audit sync](./skills-audit-sync.md).

Preview without writes: `pnpm release:tag --dry-run`.

## Durable docs vs pending changesets

Pending files under `.changeset/*.md` (other than `README.md`) are **temporary**: `pnpm release:tag` consumes them into package `CHANGELOG.md` files and deletes them. Do **not** link ADRs, feature, client, or developer narrative shards to those pending files. Point consumers at package CHANGELOGs or GitHub Releases instead. Linking `.changeset/config.json` or `.changeset/README.md` from developer release docs is fine — those are stable tooling references. `pnpm docs:check` runs `docs:lint:changeset-links` to enforce this.

## When to add a changeset

Run `pnpm changeset` and commit the generated file under `.changeset/` when a PR changes:

- `packages/mdcp-core/src/**`
- `packages/mdcp-cli/src/**`
- `packages/mdcp-presets/*.jsonc`
- Published package `package.json` metadata consumers depend on
- **`skills/**`** — consumer-facing Agent Skill packs (helpers, parent skill, install/guidance that ships via `npx skills add`)

**Do not hand-edit** `skills/*/SKILL.md` `metadata.version` in feature PRs. `pnpm release:tag` sets every skill’s `metadata.version` in lockstep with the npm/git tag. Describe skill work in a changeset (usually against `@bwilliamson/mdcp-cli`) so the note lands in the package CHANGELOG at release.

**Skip a changeset** for:

- Root `README.md`, `docs/`, `examples/` only (when the PR does **not** change `skills/` or published package sources)
- CI, Husky, or other tooling that does not change skill packs or npm package behavior
- `devDependencies` bumps in root or `packages/*/package.json` (including `@types/*`) when no other package fields or sources change
- Typo fixes in package READMEs with no behavior change (maintainer discretion)

CI on pull requests runs `pnpm changeset:status` to catch missing changesets when **package sources** or **`skills/`** changed. Package-level `devDependencies`-only bumps are treated as tooling and do not fail the check.

## Dependabot

Dependabot does not add changesets. **Non-dev dependency bumps need a human** — review the PR, add a changeset, then merge. Dev-only bumps should pass CI without one.

| Dependabot PR type                                                                         | Changeset / merge gate                                |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `dependencies`, `peerDependencies`, or `optionalDependencies` in `packages/*/package.json` | **Human approval** + **patch** changeset before merge |
| `devDependencies` only (root and/or `packages/*/package.json`), or GitHub Actions          | No changeset (CI `changeset` job should pass)         |

## Bump selection guide

When **adding** a changeset in a PR, pick the bump that best describes your change (the maintainer confirms the final bump at release):

| Your change                                                                 | Suggested bump         |
| --------------------------------------------------------------------------- | ---------------------- |
| Fixes incorrect output or validation                                        | **patch**              |
| Adds optional config or a new non-breaking command                          | **minor**              |
| Removes or renames config, changes compile output shape, drops Node support | **major**              |
| Republish without API change (CI, tooling, registry metadata)               | **build** (at release) |

At release, `pnpm release:tag` lets the maintainer choose **patch / minor / major / build** and requires typing the version plus an explicit `yes` — non-interactive tools cannot release.

### Bump types (chosen at release time)

| Choice | Bump      | Use for                                                  |
| ------ | --------- | -------------------------------------------------------- |
| 1      | **patch** | Bug fixes, no intended API change                        |
| 2      | **minor** | New features, backward compatible                        |
| 3      | **major** | Breaking CLI, config, or compile output                  |
| 4      | **build** | Republish same API (`0.1.0-build.1`, `0.1.0-build.2`, …) |

### Human confirmation gate

1. Select bump type `1`–`4`
2. Type the exact tag (e.g. `vX.Y.Z`) to confirm
3. Answer `yes` to “Do you really want to do this?”

Without a TTY, the script exits immediately.

### Automated (after tag push)

1. CI checks out the tagged commit.
2. `pnpm build` then `pnpm changeset publish` with npm provenance (OIDC).
3. GitHub Release is created with generated release notes.

First-time npm Trusted Publishing and local fallback: [Publishing](./publishing.md).

## Changelogs

Changesets writes per-package `CHANGELOG.md` files under `packages/*/` when you run `pnpm release:tag` (via `changeset version`). Consumers can read:

- GitHub Releases (summary from the action)
- `packages/mdcp-cli/CHANGELOG.md` (and core/presets) on the tag

## Supported versions

Security fixes target the **latest minor** on npm. See [SECURITY.md](../../SECURITY.md) for the supported-versions table — update that table when cutting a new minor line. After a security patch ships, follow [Security-incident triage](./security-incident-triage.md) when deciding whether to `npm deprecate` (or rarely unpublish) a bad version.

## Related docs

- [Publishing](./publishing.md) — first publish, Trusted Publishing, npm commands
- [Security-incident triage](./security-incident-triage.md) — audit impact class, deprecate vs unpublish
- [Agent Skill](./agent-skill.md) — skill pack, WIP `internal` flag, skills.sh
- [.changeset/README.md](../../.changeset/README.md) — quick changeset reference
