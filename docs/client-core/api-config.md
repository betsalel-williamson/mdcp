# API — Config

| Export                                                                                 | Purpose                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `loadConfig(path, configBase)`                                                         | Load and validate `mdcp.config.json` (`path` is resolved from `configBase`) |
| `resolveOutputPath`, `resolveRefsPath`, `resolveGuidesRoot`, `resolveGuideDir`         | Path resolvers for outputDir-relative config fields                         |
| `getGuideConfig`, `xrefScanDirs`                                                       | Per-guide and xref scan helpers                                             |
| `MdcpConfigSchema`, `MdcpConfig`, `MdcpConfigInput`, `GuideConfig`, `GuideConfigInput` | Zod schema and types                                                        |

## Path resolution: `configBase` vs docs root

The CLI and core library use **separate path bases**:

| Concern                               | Base directory                                       | Example                                                                          |
| ------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Finding `mdcp.config.json`            | `configBase` — invocation `process.cwd()` in the CLI | `--config docs/mdcp.config.json` from repo root → `<repo>/docs/mdcp.config.json` |
| `guides[].path`, `compile.outputFile` | Docs root — `--cwd`                                  | `resolveGuideDir('features', config, cwd)` → `<cwd>/features`                    |
| `outputDir`                           | Docs root — `--cwd`                                  | `resolveGuidesRoot(config, cwd)` → `<cwd>/<outputDir>`                           |
| `outputFile`, `refs.registryFile`     | `outputDir` (under docs root)                        | `resolveOutputPath(config, cwd)` → `<cwd>/<outputDir>/guides.md`                 |

`resolveOutputPath` and `resolveRefsPath` both use the same `outputDir`-relative rule and normalize cwd-relative values that already fall under `outputDir`. Details: [API — Refs](./api-refs-validation.md).

```typescript
import { loadConfig, resolveGuideDir } from '@bwilliamson/mdcp-core';

// Repo-root script: config at docs/mdcp.config.json, shards under docs/
const config = loadConfig('docs/mdcp.config.json', process.cwd());
const featuresDir = resolveGuideDir('features', config, join(process.cwd(), 'docs'));
```

Pass `process.cwd()` (or the invocation directory) as `configBase` for `loadConfig`. Pass the docs root as the `cwd` argument to `resolveGuideDir`, `resolveOutputPath`, `resolveGuidesRoot`, and `resolveRefsPath`.

Consumer path table: [Config essentials — path bases](../client-cli/config-essentials.md#config-path-bases).

Per-guide `compile.outputFile` writes a publish target and excludes that guide from the monolith. `compile.includeBanner` controls whether the global banner is prepended (defaults to `false` when `outputFile` is set).

`compile.publishPathRewrite` optionally rewrites shard-relative repo paths in publish outputs (for example `../../package.json` → `package.json` and `../features/foo.md` → `docs/features/foo.md`). Intra-guide `./section.md` links are rewritten to in-document `#anchor` links on **every** compile, including monolith output.
