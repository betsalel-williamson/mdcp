# Compile hooks

Per-shard transforms run during `assembleGuide` **before** sections are stitched. Hooks receive each shard body after heading demotion and preamble stripping; assembly-time passes (cross-guide rewrite, anchor stripping, intra-guide rewrite, optional `publishPathRewrite`) run around the hook pipeline.

Hooks assemble [authored GFM](../glossary/index.md#gfm) — not variable substitution or template logic. See [Preprocessor / templating (out of scope)](../../features/design-constraints/preprocessor-templating.md#preprocessor-templating-out-of-scope).

## Architecture

```text
assembleGuide (per guide)
  │
  ├─ for each manifest shard (in order)
  │    ├─ processSection (demote headings, strip about-this-guide)
  │    ├─ applyCompileHooks (named hooks from config, in order)
  │    └─ rewriteCrossGuideFileLinks (automatic when link index present)
  │
  └─ stitch → stripAnchors (default) → intra-guide .md → publishPathRewrite
```

**Guide link index** — built once per `compileGuideResults` from every guide in `compileOrder` (manifest sections plus transitively linked shards). Used by the automatic cross-guide pass. Optional `compile.crossGuideLinks.ignoreGuides` on the compiling guide skips monolith rewrite for listed targets. See [Cross-guide link rewriting](./cross-guide-links.md).

**Per-guide hook state** — mutable `hookState` on `CompileHookContext` (for example `inlineInserts` counters and first-anchor map) shared across shard invocations within one guide compile.

**Path resolution** — most hooks resolve relative paths from `dirname(sourceFile)` (the current shard), then parent, then `compile.scopeRoot`, then cwd. Rebasing for rendered output uses `outputFile` / monolith path via `resolveGuideLinkBase`.

## Extension pattern

Register custom hooks in consumer or library code:

```typescript
import { registerCompileHook } from '@bwilliamson/mdcp-core';

registerCompileHook('myHook', (ctx) => {
  return ctx.body.replace(/TODO/g, 'DONE');
});
```

Custom hooks are **not** in the default pipeline — list them explicitly in `compile.hooks` when needed.

Hook implementations should be **pure on `ctx.body`** except when intentionally using shared `hookState`. Leave unmatched links unchanged. Prefer docs-first specs with tests mapped to spec sections (see each hook shard below).

## Configuration

Built-in hooks run **by default**. Omit `compile.hooks` for the common case. Optional per-hook config lives under `guides[].compile.hooksConfig`.

```json
{
  "name": "glossary",
  "compile": {
    "scopeRoot": ".",
    "outputFile": "glossary.md",
    "hooksConfig": {
      "inlineInserts": { "searchRoots": ["diagrams"] }
    },
    "crossGuideLinks": {
      "ignoreGuides": ["technical-guide"]
    }
  }
}
```

### Opt out per hook

Disable specific defaults with an object on `compile.hooks` (`false` removes a hook):

```json
{
  "compile": {
    "hooks": { "inlineInserts": false }
  }
}
```

### Explicit override

Replace the entire default pipeline with a string array (backward compatible):

```json
{
  "compile": {
    "hooks": ["stripAnchors", "codeEvidence"]
  }
}
```

Default hook order and behavior: [Default compile hooks](../../features/default-compile-hooks.md). Config API: [API — Config](../api-config.md).

For manifest compile order and `compile.sectionsHeading`, see [Manifest compile order](../../features/manifest-compile-order.md).

## Built-in hooks

- **`stripAnchors`** — per shard (also default post-stitch). Removes explicit anchor markers.
- **`codeEvidence`** — per shard. [codeEvidence](./code-evidence.md): repo source links → `#L` fragments.
- **`inlineInserts`** — per shard. [inlineInserts](./inline-inserts.md): inline captioned insert libraries.
- **Cross-guide rewrite** _(assembly)_ — per shard before stitch. [Cross-guide links](./cross-guide-links.md): automatic from `compileOrder`; optional `crossGuideLinks.ignoreGuides`.

`stripAnchors` is also controlled by `compile.stripAnchors` (default `true`) after assembly.
