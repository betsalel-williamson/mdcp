# @bwilliamson/mdcp-core

## Overview

Core library for **mdcp** — compile sharded Markdown guides, build section link registries, validate structure, and export LLM-friendly output.

Use this package when you need mdcp behavior in scripts, CI pipelines, editors, or other tools without shelling out to the CLI.

### Requirements

- Node.js **>= 22.12.0**

### Install

```bash
npm install @bwilliamson/mdcp-core
```

The CLI (`@bwilliamson/mdcp-cli`) depends on this package. Install `@bwilliamson/mdcp-core` directly only when you need the programmatic API.

### Stability

**Pre-1.0:** There is **no API stability guarantee** until **1.0.0**. Exported functions, types, `mdcp.config.json` schema, and compile output may change in any `0.x.y` release. Pin a specific version and read package changelogs before upgrading.

## Quick example

```typescript
import {
  loadConfig,
  compileGuides,
  resolveGuidesRoot,
  genRefsFromCompiled,
  resolveRefsPath,
  lookupHeadings,
  buildSlugRegistry,
  stripForLlm,
  getLlmExportOptions,
} from '@bwilliamson/mdcp-core';

const cwd = '/path/to/docs';
const config = loadConfig('mdcp.config.json', cwd);

const compiled = compileGuides({
  guidesRoot: resolveGuidesRoot(config, cwd),
  compileOrder: config.compileOrder,
  banner: config.banner,
  guides: config.guides,
  cwd,
  config,
});

const refsPath = resolveRefsPath(cwd, config.outputDir, config.refs.registryFile);
genRefsFromCompiled(compiled, refsPath);

const registry = buildSlugRegistry(compiled);
const matches = lookupHeadings(registry, 'authentication');

const llmText = stripForLlm(compiled, getLlmExportOptions(config));
```

Use `writeCompiledGuides` when you need to write the monolith and per-guide publish outputs to disk.

## API — Config

| Export                                                                                 | Purpose                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `loadConfig(path, configBase)`                                                         | Load and validate `mdcp.config.json` (`path` is resolved from `configBase`) |
| `resolveOutputPath`, `resolveRefsPath`, `resolveGuidesRoot`, `resolveGuideDir`         | Path resolvers for outputDir-relative config fields                         |
| `getGuideConfig`, `xrefScanDirs`                                                       | Per-guide and xref scan helpers                                             |
| `MdcpConfigSchema`, `MdcpConfig`, `MdcpConfigInput`, `GuideConfig`, `GuideConfigInput` | Zod schema and types                                                        |

### Path resolution: `configBase` vs docs root

The CLI and core library use **separate path bases**:

| Concern                               | Base directory                                       | Example                                                                          |
| ------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Finding `mdcp.config.json`            | `configBase` — invocation `process.cwd()` in the CLI | `--config docs/mdcp.config.json` from repo root → `<repo>/docs/mdcp.config.json` |
| `guides[].path`, `compile.outputFile` | Docs root — `--cwd`                                  | `resolveGuideDir('features', config, cwd)` → `<cwd>/features`                    |
| `outputDir`                           | Docs root — `--cwd`                                  | `resolveGuidesRoot(config, cwd)` → `<cwd>/<outputDir>`                           |
| `outputFile`, `refs.registryFile`     | `outputDir` (under docs root)                        | `resolveOutputPath(config, cwd)` → `<cwd>/<outputDir>/guides.md`                 |

`resolveOutputPath` and `resolveRefsPath` both use the same `outputDir`-relative rule and normalize cwd-relative values that already fall under `outputDir`. Details: [API — Refs](#api-refs-and-validation).

```typescript
import { loadConfig, resolveGuideDir } from '@bwilliamson/mdcp-core';

// Repo-root script: config at docs/mdcp.config.json, shards under docs/
const config = loadConfig('docs/mdcp.config.json', process.cwd());
const featuresDir = resolveGuideDir('features', config, join(process.cwd(), 'docs'));
```

Pass `process.cwd()` (or the invocation directory) as `configBase` for `loadConfig`. Pass the docs root as the `cwd` argument to `resolveGuideDir`, `resolveOutputPath`, `resolveGuidesRoot`, and `resolveRefsPath`.

Consumer path table: [Config essentials — path bases](../client-cli/config-essentials.md#config-path-bases).

Per-guide `compile.outputFile` writes a publish target and excludes that guide from the monolith. `compile.includeBanner` controls whether the global banner is prepended (defaults to `false` when `outputFile` is set).

`compile.title` injects a `##` heading at the start of the assembled guide, separated from the first section by a blank line. When the first shard’s top heading matches the title text, that duplicate heading is stripped before assembly.

`compile.publishPathRewrite` optionally rewrites shard-relative repo paths in publish outputs (for example `../../package.json` → `package.json` and `../features/foo.md` → `docs/features/foo.md`). Intra-guide `./section.md` links are rewritten to in-document `#anchor` links on **every** compile, including monolith output.

## API — Compile

| Export                                            | Purpose                                               |
| ------------------------------------------------- | ----------------------------------------------------- |
| `compileGuides`, `compileGuideResults`            | Stitch shards into monolith text                      |
| `writeCompiledGuides`                             | Write monolith and publish outputs to disk            |
| `sectionFiles`, `processSection`, `assembleGuide` | Lower-level assemble pipeline                         |
| `formatCompileTitle`, `extractFirstHeading`, …    | Optional `compile.title` injection and deduplication  |
| `demoteHeadings`, `stripAboutThisGuideHeading`, … | Heading transforms                                    |
| `registerCompileHook`, `applyCompileHooks`        | Extension hooks (`stripAnchors`, `inlineDiagrams`, …) |

`compileGuides` returns monolith text only — guides with `compile.outputFile` are excluded. `writeCompiledGuides` writes both the monolith and any publish targets.

When `compile.title` is set, `assembleGuide` injects a `##` heading followed by a blank line before the first section. See [API — Config](#api-config) for per-guide compile fields.

## API — Refs and validation

### Refs (cross-links)

| Export                                                         | Purpose                    |
| -------------------------------------------------------------- | -------------------------- |
| `buildSlugRegistry`, `lookupHeadings`, `githubSlugify`         | GitHub-style heading slugs |
| `genRefsFromCompiled`, `readRefsRegistry`, `checkRefsRegistry` | `refs.json` lifecycle      |
| `resolveRefsPath`, `writeRefsRegistry`                         | Path and I/O helpers       |

#### `resolveRefsPath(cwd, outputDir, registryFile)`

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

### Manifest

| Export                          | Purpose                                        |
| ------------------------------- | ---------------------------------------------- |
| `sectionFiles`, `assembleGuide` | Resolve compile order from manifest link order |

### Validation

| Export                                  | Purpose                                 |
| --------------------------------------- | --------------------------------------- |
| `checkOrphans`, `checkOrphansForGuides` | Detect unlinked or missing shard files  |
| `lintXrefs`                             | Chapter-style cross-reference detection |

## API — Export, shard, and peers

### Export

| Export                               | Purpose                           |
| ------------------------------------ | --------------------------------- |
| `stripForLlm`, `getLlmExportOptions` | Token-optimized output for agents |

### Shard (split)

| Export                           | Purpose                                 |
| -------------------------------- | --------------------------------------- |
| `shardFromMonolith`, `runMdTree` | Split a monolith into guide directories |

### Peer tools

| Export                      | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `findPeerBinary`, `runPeer` | Locate and run host-repo linters (`markdownlint-cli2`, `vale`, …) |

Peer linters are not bundled. Detection order: `node_modules/.bin` → PATH → skip with info.

## Compile hooks

Register custom per-shard transforms:

```typescript
import { registerCompileHook } from '@bwilliamson/mdcp-core';

registerCompileHook('myHook', (ctx) => {
  return ctx.body.replace(/TODO/g, 'DONE');
});
```

Built-in hook names are configured in `mdcp.config.json` under `guides[].compile.hooks`:

- **`stripAnchors`** — removes explicit `` markers per shard
- **`codeEvidence`** — rewrites Evidence / source-file links to `#L` fragments
- **`inlineDiagrams`** — inlines diagram markdown via directive or diagram-path links
- **`reviewLinks`** — rewrites finding and cross-guide links for monolith cohesion (`hooksConfig.reviewLinks.targetMonolith`)

Optional hook config under `guides[].compile.hooksConfig`. Use `compile.sectionsHeading` (e.g. `"Sections"`) so only links under that `##` heading count toward compile order when the manifest has preamble prose with example links.

Details in the [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md).

## Related packages

| Package                                                                                | Use                           |
| -------------------------------------------------------------------------------------- | ----------------------------- |
| [`@bwilliamson/mdcp-cli`](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)         | `mdcp` command-line interface |
| [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) | Starter markdownlint configs  |

### Further reading

- [Project README](https://github.com/betsalel-williamson/mdcp#readme)
- [Design constraints](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/design-constraints.md)
- [CLI package docs](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)

### License

MIT
