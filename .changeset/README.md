# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) for versioning `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, and `@bwilliamson/mdcp-presets` together.

## Adding a changeset

```bash
pnpm changeset
```

Describe your change and select affected packages. Commit the generated file under `.changeset/`.

## Release

Maintainers merge the Changesets version PR, then the release workflow publishes to npm with provenance.

See [PUBLISH.md](../PUBLISH.md).
