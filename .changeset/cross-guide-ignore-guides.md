---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
'@bwilliamson/mdcp-presets': minor
---

Replace `reviewLinks` compile hook with assembly-time `compile.crossGuideLinks.ignoreGuides`.

**Changed (pre-1.0 API):**

- Remove `reviewLinks` from the default compile hook pipeline
- Remove `hooksConfig.reviewLinks` and `targetMonolith`

**Added:**

- `compile.crossGuideLinks.ignoreGuides` on the compiling guide — cross-guide links to listed guides keep source `.md` shard paths instead of rewriting to monolith `#slug` targets

Cross-guide link rewriting remains automatic at assembly from `compileOrder` and per-guide `compile.outputFile`. Multi-output layouts route each link to the correct compiled document by default.
