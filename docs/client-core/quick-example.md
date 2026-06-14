# Quick example

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
