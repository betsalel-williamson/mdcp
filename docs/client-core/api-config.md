# API — Config

| Export                                                                                 | Purpose                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `loadConfig(path, configBase)`                                                         | Load and validate `mdcp.config.json` (`path` is resolved from `configBase`) |
| `resolveOutputPath`, `resolveRefsPath`, `resolveGuideDir`, `defaultGuideOutputFile`    | Path resolvers for docs root and `outputDir`                                |
| `getGuideConfig`, `guideScanDirs`, `shardLintPaths`, `xrefScanDirs`                    | In-scope guide fileset and xref scan helpers                                |
| `MdcpConfigSchema`, `MdcpConfig`, `MdcpConfigInput`, `GuideConfig`, `GuideConfigInput` | Zod schema and types                                                        |
| `DEFAULT_COMPILE_HOOKS`, `resolveCompileHooks`                                         | Default built-in hook pipeline and guide-level resolution                   |

## Path resolution: `configBase` vs docs root

| Concern                    | Base                          | Example                                                                       |
| -------------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| Finding `mdcp.config.json` | `configBase` (invocation dir) | `--config docs/mdcp.config.json` → `<repo>/docs/mdcp.config.json`             |
| Guide shards (default)     | Docs root (`--docs-root`)     | `resolveGuideDir('features', config, docsRoot)` → `<docsRoot>/features`       |
| `outputDir`                | Docs root                     | `_build` → `<docsRoot>/_build`                                                |
| All generated paths        | `outputDir`                   | `features.md` → `<docsRoot>/_build/features.md`; `.caches/refs.json` for refs |

All generated paths use `resolveUnderOutputDir(docsRoot, outputDir, file)` — relative to `outputDir` unless `file` is absolute. Details: [API — Refs](./api-refs-validation.md).

```typescript
import { loadConfig, resolveGuideDir } from '@bwilliamson/mdcp-core';

const config = loadConfig('docs/mdcp.config.json', process.cwd());
const featuresDir = resolveGuideDir('features', config, join(process.cwd(), 'docs'));
```

Pass `process.cwd()` as `configBase` for `loadConfig`. Pass the docs root as `docsRoot` to `resolveGuideDir`, `resolveOutputPath`, and `resolveRefsPath`.

Consumer path table: [Config essentials — path layout](../client-cli/config-essentials.md#path-layout).

**Defaults:** `outputDir` `_build`; per-guide outputs `{name}.md` (or `guide.md` when one guide); optional monolith when `outputFile` is set; refs at `.caches/refs.json`.

`compile.outputFile` overrides a guide's output path (relative to `outputDir` or absolute). Guides with an explicit `compile.outputFile` are excluded from an optional monolith.

`compile.includeBanner` controls whether the global banner is prepended (defaults to `false` for per-guide outputs).

`compile.publishPathRewrite` rewrites shard-relative repo paths in publish outputs. Intra-guide `./section.md` links rewrite to `#anchor` on every compile.

## `compile.hooks`

Built-in hooks run by default when `compile.hooks` is omitted. See [Default compile hooks](../features/default-compile-hooks.md).

- **Omitted** — run `DEFAULT_COMPILE_HOOKS` in order: `stripAnchors`, `codeEvidence`, `inlineInserts`, `reviewLinks`
- **`string[]`** — explicit override; replaces defaults entirely (backward compatible)
- **`Record<string, boolean>`** — opt out; keys with `false` remove that hook from defaults

Optional per-hook settings: `compile.hooksConfig` (`reviewLinks.targetMonolith`, `inlineInserts.searchRoots`). Post-stitch anchor stripping: `compile.stripAnchors` (default `true`), independent of the per-shard `stripAnchors` hook unless opted out.
