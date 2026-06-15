# reviewLinks

Compile hook that delegates to the same cross-guide rewrite engine as the automatic assembly pass. Tests in `packages/mdcp-core/test/builtin-hooks.test.ts` cover the `targetMonolith` override.

Runs by default. Set **`hooksConfig.reviewLinks.targetMonolith`** to force all resolved cross-guide links onto one output file (legacy consumer monoliths):

```json
{
  "name": "glossary",
  "compile": {
    "hooksConfig": {
      "reviewLinks": { "targetMonolith": "architecture-review.md" }
    }
  }
}
```

When `targetMonolith` is set, indexed targets in other outputs are rewritten to `{targetMonolith}#slug` instead of their native `outputFile`. When omitted, the hook uses the guide link index (same behavior as the automatic per-shard pass).

Opt out: `"hooks": { "reviewLinks": false }`. See [Default compile hooks](../../features/default-compile-hooks.md).

For index building, resolution rules, and multi-output layouts, see [Cross-guide link rewriting](./cross-guide-links.md).
