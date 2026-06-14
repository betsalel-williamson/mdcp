# API — Refs and validation

## Refs (cross-links)

| Export                                                         | Purpose                    |
| -------------------------------------------------------------- | -------------------------- |
| `buildSlugRegistry`, `lookupHeadings`, `githubSlugify`         | GitHub-style heading slugs |
| `genRefsFromCompiled`, `readRefsRegistry`, `checkRefsRegistry` | `refs.json` lifecycle      |
| `resolveRefsPath`, `writeRefsRegistry`                         | Path and I/O helpers       |

### `resolveRefsPath(docsRoot, outputDir, registryFile)`

Resolves the on-disk path for the refs registry. Implemented via the same `outputDir`-relative helper as `resolveOutputPath`. Pass the docs root (the CLI `--docs-root` value).

- `outputDir` is relative to `docsRoot`.
- `registryFile` is relative to `outputDir` (default `.caches/refs.json`).

```typescript
resolveRefsPath('/docs', '_build', '.caches/refs.json');
// → /docs/_build/.caches/refs.json

resolveRefsPath('/docs', '.', 'refs.json');
// → /docs/refs.json
```

Prefer outputDir-relative values in config (for example `".caches/refs.json"` when `outputDir` is `"_build"`). See [Config essentials — path layout](../client-cli/config-essentials.md#path-layout).

## Manifest

| Export                          | Purpose                                        |
| ------------------------------- | ---------------------------------------------- |
| `sectionFiles`, `assembleGuide` | Resolve compile order from manifest link order |

## Validation

| Export                                  | Purpose                                 |
| --------------------------------------- | --------------------------------------- |
| `checkOrphans`, `checkOrphansForGuides` | Detect unlinked or missing shard files  |
| `lintXrefs`                             | Chapter-style cross-reference detection |
