---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
---

Add compile-time cross-guide link rewriting for multi-output consumer repos: build a transitive guide link index from `compileOrder`, rewrite `../` and `./` markdown links per shard to stable cross-monolith `#slug` targets, and derive `FIND-*` slugs from filenames. Export `buildGuideLinkIndex`, `rewriteCrossGuideFileLinks`, and related types. The `reviewLinks` hook now delegates to the same rewrite engine (optional `targetMonolith` override).
