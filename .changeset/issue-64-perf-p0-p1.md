---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
'@bwilliamson/mdcp-presets': patch
---

Performance (#64): compile once per `mdcp compile`/`check` (P0) and compile-scoped shard cache so each shard is read once per command (P1). Dogfood meets Tier 1–4 SLOs at ~64 shards.
