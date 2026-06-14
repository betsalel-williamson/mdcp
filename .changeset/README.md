# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) for versioning `@mdcp/core`, `@mdcp/cli`, and `@mdcp/presets` together.

## Adding a changeset

```bash
pnpm changeset
```

Describe your change and select affected packages. Commit the generated file under `.changeset/`.

## Release

Maintainers merge the Changesets version PR, then the release workflow publishes to npm with provenance.

See [PUBLISH.md](../PUBLISH.md).
