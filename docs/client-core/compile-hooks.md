# Compile hooks

Register custom per-shard transforms:

```typescript
import { registerCompileHook } from '@bwilliamson/mdcp-core';

registerCompileHook('myHook', (ctx) => {
  return ctx.body.replace(/TODO/g, 'DONE');
});
```

Built-in hook names are configured in `mdcp.config.json` under `guides[].compile.hooks`:

- **`stripAnchors`** — removes explicit `{#anchor}` markers per shard
- **`codeEvidence`** — rewrites Evidence / source-file links to `#L` fragments
- **`inlineDiagrams`** — inlines diagram markdown via directive or diagram-path links
- **`reviewLinks`** — rewrites finding and cross-guide links for monolith cohesion (`hooksConfig.reviewLinks.targetMonolith`)

Optional hook config under `guides[].compile.hooksConfig`. Use `compile.sectionsHeading` (e.g. `"Sections"`) so `mdcp sections` only picks links under that `##` heading.

Details in the [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md).
