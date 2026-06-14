# @bwilliamson/mdcp-core

Core library for **mdcp** — compile sharded Markdown guides, build section link registries, validate structure, and export LLM-friendly output.

Use this package when you need mdcp behavior in scripts, CI pipelines, editors, or other tools without shelling out to the CLI.

## Requirements

- Node.js **>= 22.12.0**

## Install

```bash
npm install @bwilliamson/mdcp-core
```

The CLI (`@bwilliamson/mdcp-cli`) depends on this package. Install `@bwilliamson/mdcp-core` directly only when you need the programmatic API.

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

## API overview

### Config

| Export                                                      | Purpose                              |
| ----------------------------------------------------------- | ------------------------------------ |
| `loadConfig(path, cwd)`                                     | Load and validate `mdcp.config.json` |
| `resolveOutputPath`, `resolveGuidesRoot`, `resolveGuideDir` | Resolve paths from config            |
| `getGuideConfig`, `xrefScanDirs`                            | Per-guide and xref scan helpers      |
| `MdcpConfigSchema`, `MdcpConfig`, `GuideConfig`             | Zod schema and types                 |

### Compile

| Export                                            | Purpose                                               |
| ------------------------------------------------- | ----------------------------------------------------- |
| `compileGuides`, `compileGuideResults`            | Stitch shards into monolith text                      |
| `writeCompiledGuides`                             | Write compiled output to disk                         |
| `sectionFiles`, `processSection`, `assembleGuide` | Lower-level assemble pipeline                         |
| `demoteHeadings`, `stripAboutThisGuideHeading`, … | Heading transforms                                    |
| `registerCompileHook`, `applyCompileHooks`        | Extension hooks (`stripAnchors`, `inlineDiagrams`, …) |

### Manifest

| Export                                               | Purpose                                   |
| ---------------------------------------------------- | ----------------------------------------- |
| `writeSectionsManifest`, `writeAllSectionsManifests` | Regenerate `sections.txt` from `index.md` |

### Refs (cross-links)

| Export                                                         | Purpose                    |
| -------------------------------------------------------------- | -------------------------- |
| `buildSlugRegistry`, `lookupHeadings`, `githubSlugify`         | GitHub-style heading slugs |
| `genRefsFromCompiled`, `readRefsRegistry`, `checkRefsRegistry` | `refs.json` lifecycle      |
| `resolveRefsPath`, `writeRefsRegistry`                         | Path and I/O helpers       |

### Validation

| Export                                  | Purpose                                  |
| --------------------------------------- | ---------------------------------------- |
| `checkOrphans`, `checkOrphansForGuides` | Detect unlinked or missing shard files   |
| `lintXrefs`                             | Bare `Ch. N` / `See Chapter N` detection |

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

## Compile hooks

Register custom per-shard transforms:

```typescript
import { registerCompileHook } from '@bwilliamson/mdcp-core';

registerCompileHook('myHook', (ctx) => {
  return ctx.body.replace(/TODO/g, 'DONE');
});
```

Built-in hook names are configured in `mdcp.config.json` under `guides[].compile.hooks`. See [docs/FEATURES.md](https://github.com/betsalel-williamson/mdcp/blob/main/docs/FEATURES.md) for the built-in set.

## Related packages

| Package                                                                                | Use                           |
| -------------------------------------------------------------------------------------- | ----------------------------- |
| [`@bwilliamson/mdcp-cli`](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)         | `mdcp` command-line interface |
| [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) | Starter markdownlint configs  |

## Further reading

- [Project README](https://github.com/betsalel-williamson/mdcp#readme)
- [Design constraints](https://github.com/betsalel-williamson/mdcp/blob/main/docs/design.md)

## License

MIT
