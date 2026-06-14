---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
---

Fix `refs.registryFile` and monolith `outputFile` path resolution when a cwd-relative path is given under `outputDir`. Both fields are relative to `outputDir`; cwd-relative values are normalized via shared `resolveUnderOutputDir` instead of double-joining.
