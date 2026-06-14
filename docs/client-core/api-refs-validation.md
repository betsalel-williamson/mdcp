# API — Refs and validation

## Refs (cross-links)

| Export                                                         | Purpose                    |
| -------------------------------------------------------------- | -------------------------- |
| `buildSlugRegistry`, `lookupHeadings`, `githubSlugify`         | GitHub-style heading slugs |
| `genRefsFromCompiled`, `readRefsRegistry`, `checkRefsRegistry` | `refs.json` lifecycle      |
| `resolveRefsPath`, `writeRefsRegistry`                         | Path and I/O helpers       |

### `resolveRefsPath(cwd, outputDir, registryFile)`

Resolves the on-disk path for the refs registry. Implemented via the same `outputDir`-relative helper as `resolveOutputPath`. Pass the docs root as `cwd` (the CLI `--cwd` value).

- `outputDir` is relative to `cwd`.
- `registryFile` is relative to `outputDir` (not `cwd`).

```typescript
resolveRefsPath('/docs', '_build/compiled', 'refs.json');
// → /docs/_build/compiled/refs.json

resolveRefsPath('/docs', '.', 'refs.json');
// → /docs/refs.json
```

If `registryFile` or monolith `outputFile` is accidentally given as a cwd-relative path that already falls under `outputDir`, MDCP uses the cwd-relative interpretation so the path is not joined twice:

```typescript
resolveRefsPath('/docs', '_build/compiled', '_build/compiled/refs.json');
// → /docs/_build/compiled/refs.json (normalized)
```

Prefer outputDir-relative values in config (for example `"refs.json"` when `outputDir` is `"_build/compiled"`). See [Config essentials — path bases](../client-cli/config-essentials.md#config-path-bases).

## Manifest

| Export                                               | Purpose                                   |
| ---------------------------------------------------- | ----------------------------------------- |
| `writeSectionsManifest`, `writeAllSectionsManifests` | Regenerate `sections.txt` from `index.md` |

## Validation

| Export                                  | Purpose                                 |
| --------------------------------------- | --------------------------------------- |
| `checkOrphans`, `checkOrphansForGuides` | Detect unlinked or missing shard files  |
| `lintXrefs`                             | Chapter-style cross-reference detection |
