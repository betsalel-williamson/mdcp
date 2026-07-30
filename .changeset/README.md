# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) for **independent** semver of:

- `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-presets` (npm + GitHub Releases)
- `@bwilliamson/skill-<id>` private carriers under `packages/skill-<id>/` (GitHub Releases only)

A changeset only bumps the packages you select. **Do not** put `package.json` or `CHANGELOG.md` under `skills/` — those pollute `npx skills add` installs.

## Adding a changeset

```bash
pnpm changeset
```

Select **patch** or **minor** (majors blocked until 1.0). Skill edits under `skills/<id>/` target **`@bwilliamson/skill-<id>`**.

## Verify before opening a PR

```bash
pnpm changeset:reject-major
pnpm changeset:status
```

## Release

Merge to `main` → approve the `release` environment → CI runs **`pnpm release:main`** (version + publish + GitHub Releases in one job). See [docs/developer/versioning-and-releases.md](../docs/developer/versioning-and-releases.md).
