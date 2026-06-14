# Quick example

```typescript
import {
  loadConfig,
  compileGuides,
  resolveDocsRoot,
  genRefsFromCompiled,
  resolveRefsPath,
  lookupHeadings,
  buildSlugRegistry,
  stripForLlm,
  getLlmExportOptions,
} from '@bwilliamson/mdcp-core';

const docsRoot = '/path/to/docs';
const config = loadConfig('mdcp.config.json', docsRoot);

const compiled = compileGuides({
  guidesRoot: resolveDocsRoot(config, docsRoot),
  compileOrder: config.compileOrder,
  banner: config.banner,
  guides: config.guides,
  docsRoot,
  config,
});

const refsPath = resolveRefsPath(docsRoot, config.outputDir, config.refs.registryFile);
genRefsFromCompiled(compiled, refsPath);

const registry = buildSlugRegistry(compiled);
const matches = lookupHeadings(registry, 'authentication');

const llmText = stripForLlm(compiled, getLlmExportOptions(config));
```

Use `writeCompiledGuides` when you need to write the monolith and per-guide publish outputs to disk.
