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
- **`codeEvidence`**, **`reviewLinks`**, **`inlineDiagrams`** — reserved names (passthrough placeholders today; extend via `registerCompileHook` in your repo)

Default `compile.stripAnchors: true` also strips anchors on the full assembled guide without naming the hook.

Details in the [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md).
