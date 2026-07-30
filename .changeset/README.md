# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) for **independent** semver versioning of:

- `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-presets` (npm)
- `@bwilliamson/skill-<id>` private carriers under `skills/<id>/` (Git only)

A changeset only bumps the packages you select.

## Adding a changeset

```bash
pnpm changeset
```

Describe your change and select **patch** or **minor** for each affected package/skill. **Major is blocked** until maintainers open 1.0 (`pnpm changeset:reject-major`). Commit the generated file under `.changeset/`.

### Which bump?

| Change                                             | Bump  |
| -------------------------------------------------- | ----- |
| Bug fix                                            | patch |
| New command, config field, hook, or skill behavior | minor |
| Breaking CLI, config, or compile output (pre-1.0)  | minor |

Skill pack edits under `skills/<id>/` need a changeset against **`@bwilliamson/skill-<id>`**. Do **not** hand-edit `skills/*/SKILL.md` `metadata.version` — `pnpm release:version` syncs from the skill `package.json`.

Full policy: [docs/developer/versioning-and-releases.md](../docs/developer/versioning-and-releases.md).

## Verify before opening a PR

```bash
pnpm changeset:reject-major
pnpm changeset:status
```

Fails if you used `major`, or if you changed package code **or** `skills/` since the PR/upstream base (fallback: `origin/main`) without a pending changeset.

## Release

1. Merge feature PRs (with changesets) to `main`.
2. CI opens or updates the **Version Packages** PR (independent bumps + skill frontmatter sync).
3. Merge that PR; CI publishes bumped public packages to npm.

See [DEVELOPERS.md](../DEVELOPERS.md) ([Publishing](../DEVELOPERS.md#publishing)) and [docs/developer/versioning-and-releases.md](../docs/developer/versioning-and-releases.md).
