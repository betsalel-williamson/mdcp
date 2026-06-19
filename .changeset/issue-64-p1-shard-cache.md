---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': patch
---

Add compile-scoped shard cache so each shard file is read once per compile/check. Memoize guide link index and pass it through link lint to avoid redundant index rebuilds.

Part of #64 P1 read-amplification work.
