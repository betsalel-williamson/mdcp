# Compile hooks

Per-shard transforms run during `assembleGuide` **before** sections are stitched. Hooks receive each shard body after heading demotion and preamble stripping; assembly-time passes (anchor stripping, cross-guide rewrite, intra-guide rewrite, optional `publishPathRewrite`) run after all hooks complete.

Hooks assemble [authored GFM](../glossary/index.md#gfm) — not variable substitution or template logic. See [Preprocessor / templating (out of scope)](../../features/design-constraints.md#preprocessor-templating-out-of-scope).

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

**Guide link index** — built once per `compileGuideResults` from every guide in `compileOrder` (manifest sections plus transitively linked shards). Passed into hook context and the automatic cross-guide pass. See [Cross-guide link rewriting](./cross-guide-links.md).

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

List hook names in `mdcp.config.json` under `guides[].compile.hooks` (order matters). Optional per-hook config lives under `guides[].compile.hooksConfig`.

Hook implementations should be **pure on `ctx.body`** except when intentionally using shared `hookState`. Leave unmatched links unchanged. Prefer docs-first specs with tests mapped to spec sections (see each hook shard below).

## Configuration

```json
{
  "name": "architecture-review",
  "compile": {
    "scopeRoot": ".",
    "outputFile": "architecture-review.md",
    "hooks": ["stripAnchors", "codeEvidence", "inlineInserts"],
    "hooksConfig": {
      "inlineInserts": { "searchRoots": ["diagrams"] },
      "reviewLinks": { "targetMonolith": "architecture-review.md" }
    }
  }
}
```

For manifest compile order and `compile.sectionsHeading`, see [Manifest compile order](../../features/manifest-compile-order.md).

## Built-in hooks

- **`stripAnchors`** — per shard (also default post-stitch). Removes explicit anchor markers.
- **`codeEvidence`** — per shard. [codeEvidence](./code-evidence.md): repo source links → `#L` fragments.
- **`inlineInserts`** — per shard. [inlineInserts](./inline-inserts.md): inline captioned insert libraries.
- **Cross-guide rewrite** _(assembly)_ — per shard + post-stitch. [Cross-guide links](./cross-guide-links.md): automatic from `compileOrder`.
- **`reviewLinks`** — per shard (optional). [reviewLinks](./review-links.md): `targetMonolith` override for cross-guide targets.

`stripAnchors` is also controlled by `compile.stripAnchors` (default `true`) after assembly. Cross-guide rewrite runs automatically for multi-output layouts; add `reviewLinks` only when forcing all cross-links onto one output file.
