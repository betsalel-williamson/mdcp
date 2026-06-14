# API — Config

| Export                                                                                 | Purpose                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `loadConfig(path, configBase)`                                                         | Load and validate `mdcp.config.json` (`path` is resolved from `configBase`) |
| `resolveOutputPath`, `resolveRefsPath`, `resolveGuidesRoot`, `resolveGuideDir`         | Path resolvers for outputDir-relative config fields                         |
| `getGuideConfig`, `guideScanDirs`, `shardLintPaths`, `xrefScanDirs`                    | In-scope guide fileset and xref scan helpers                                |
| `MdcpConfigSchema`, `MdcpConfig`, `MdcpConfigInput`, `GuideConfig`, `GuideConfigInput` | Zod schema and types                                                        |

## Path resolution: `configBase` vs docs root

The CLI and core library use **separate path bases**:

| Concern                           | Base directory                                       | Example                                                                          |
| --------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Finding `mdcp.config.json`        | `configBase` — invocation `process.cwd()` in the CLI | `--config docs/mdcp.config.json` from repo root → `<repo>/docs/mdcp.config.json` |
| `guides[].path`                   | Docs root — `--cwd`                                  | `resolveGuideDir('features', config, cwd)` → `<cwd>/features`                    |
| `outputDir`                       | Docs root — `--cwd`                                  | `resolveGuidesRoot(config, cwd)` → `<cwd>/<outputDir>`                           |
| `outputFile`, `refs.registryFile` | `outputDir` (under docs root)                        | `resolveOutputPath(config, cwd)` → `<cwd>/<outputDir>/guides.md`                 |
| `compile.outputFile`              | `outputDir` when no `..`; else `--cwd` (publish)     | `resolveGuideOutputPath(cwd, outputDir, file)` → `<cwd>/<outputDir>/glossary.md` |

`resolveOutputPath` and `resolveRefsPath` both use the same `outputDir`-relative rule and normalize cwd-relative values that already fall under `outputDir`. Per-guide outputs use `resolveGuideOutputPath` (same join/normalize helper; `..` paths skip the join for repo publish targets). Details: [API — Refs](./api-refs-validation.md).

```typescript
import { loadConfig, resolveGuideDir } from '@bwilliamson/mdcp-core';

// Repo-root script: config at docs/mdcp.config.json, shards under docs/
const config = loadConfig('docs/mdcp.config.json', process.cwd());
const featuresDir = resolveGuideDir('features', config, join(process.cwd(), 'docs'));
```

Pass `process.cwd()` (or the invocation directory) as `configBase` for `loadConfig`. Pass the docs root as the `cwd` argument to `resolveGuideDir`, `resolveOutputPath`, `resolveGuidesRoot`, and `resolveRefsPath`.

Consumer path table: [Config essentials — path bases](../client-cli/config-essentials.md#config-path-bases).

Per-guide `compile.outputFile` writes a publish target and excludes that guide from the monolith. Bare filenames resolve under `outputDir`; paths with `..` resolve from `--cwd` for npm READMEs and repo-root publish targets. `compile.includeBanner` controls whether the global banner is prepended (defaults to `false` when `outputFile` is set).

`compile.title` injects a `##` heading at the start of the assembled guide, separated from the first section by a blank line. When the first shard’s top heading matches the title text, that duplicate heading is stripped before assembly.

`compile.publishPathRewrite` optionally rewrites shard-relative repo paths in publish outputs (for example `../../package.json` → `package.json` and `../features/foo.md` → `docs/features/foo.md`). Intra-guide `./section.md` links are rewritten to in-document `#anchor` links on **every** compile, including monolith output.
