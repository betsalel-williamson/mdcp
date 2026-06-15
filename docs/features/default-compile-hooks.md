# Default compile hooks

Built-in compile hooks run on every guide compile **without** listing hook names in config. Authors express intent in shard markdown (evidence links, insert libraries, cross-guide links); hook enablement is not a second manifest.

## Problem

Consumer configs repeat the same hook array on every guide:

```json
"hooks": ["stripAnchors", "codeEvidence", "inlineInserts", "reviewLinks"]
```

New hooks require doc churn and config edits across all guides. Most guides want the same defaults.

## Default hook pipeline

When `guides[].compile.hooks` is omitted, mdcp runs these hooks **in order** on each shard (after heading demotion and preamble stripping):

| Hook            | Purpose                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| `stripAnchors`  | Remove explicit heading anchor markers per shard; post-stitch strip uses `compile.stripAnchors` (default `true`) |
| `codeEvidence`  | Rewrite repo source links to `#L` line fragments                                                                 |
| `inlineInserts` | Inline captioned insert-library shards on first link                                                             |
| `reviewLinks`   | Cross-guide link rewrite; honors `hooksConfig.reviewLinks.targetMonolith` when set                               |

Hooks are no-ops when shard content does not match (no evidence links, no insert links, etc.). Cross-guide rewrite also runs automatically at assembly time; default-on `reviewLinks` ensures monolith override works without listing the hook when `targetMonolith` is configured.

Custom hooks registered via `registerCompileHook` are **not** included in defaults — only built-in names above.

## Configuration

### Minimal (common case)

Omit `compile.hooks`. Optional per-hook config still lives under `hooksConfig`:

```json
{
  "name": "architecture-review",
  "compile": {
    "outputFile": "architecture-review.md",
    "hooksConfig": {
      "reviewLinks": { "targetMonolith": "architecture-review.md" }
    }
  }
}
```

### Opt out per hook

Set `compile.hooks` to an object. Keys with `false` disable that hook; other keys are ignored:

```json
{
  "compile": {
    "hooks": { "inlineInserts": false, "codeEvidence": false }
  }
}
```

### Explicit override (backward compatible)

Set `compile.hooks` to a string array to replace the default pipeline entirely (existing behavior):

```json
{
  "compile": {
    "hooks": ["stripAnchors"]
  }
}
```

## Acceptance criteria

- [x] Default hook pipeline runs without `compile.hooks` when not specified
- [x] Documented opt-out mechanism (object form on `compile.hooks`)
- [x] Existing explicit `compile.hooks` string arrays continue to work
- [x] Tests for default-on behavior and selective disable
- [x] Client docs show minimal config first, opt-out second

## Implementation

`resolveCompileHooks` in `packages/mdcp-core/src/config/resolve-compile-hooks.ts` merges guide config into an effective hook name list before `assembleGuide` calls `applyCompileHooks`. Constant `DEFAULT_COMPILE_HOOKS` documents the default order.

Hook specs: [Compile hooks — overview](../client-core/compile-hooks/index.md).
