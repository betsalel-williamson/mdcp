# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) for semver versioning of `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, and `@bwilliamson/mdcp-presets` together.

## Adding a changeset

```bash
pnpm changeset
```

Describe your change and select the bump type (**patch**, **minor**, or **major**). Commit the generated file under `.changeset/`.

### Which bump?

| Change                                  | Bump  |
| --------------------------------------- | ----- |
| Bug fix                                 | patch |
| New command, config field, or hook      | minor |
| Breaking CLI, config, or compile output | major |

Full policy: [docs/developer/versioning-and-releases.md](../docs/developer/versioning-and-releases.md).

## Verify before opening a PR

```bash
pnpm changeset:status
```

Fails if you changed package code since `origin/main` without a changeset.

## Release

1. Merge feature PRs (with changesets) to `main`.
2. In a terminal on `main`, run **`pnpm release:tag:push`** — pick bump type, confirm, tag, push; CI publishes to npm.
3. See [DEVELOPERS.md](../DEVELOPERS.md) ([Publishing](../DEVELOPERS.md#publishing)) and [docs/developer/versioning-and-releases.md](../docs/developer/versioning-and-releases.md).

Human-only: the release script requires a TTY and typed confirmation. LLM agents cannot bump versions.
