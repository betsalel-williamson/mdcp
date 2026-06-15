# Cross-links and refs

When writing `` `[link text](#anchor)` `` in a shard, the anchor must match the compiled heading slug. Look it up instead of guessing:

```bash
mdcp refs lookup "getting started" --format json
mdcp refs list
```

The part after `#` must match how the compiled doc names that heading — which changes when shards are merged and headings shift level.

Section links are derived from compiled headings using the same rules GitHub uses when rendering. No hand-maintained `{#heading-ids}` required.
