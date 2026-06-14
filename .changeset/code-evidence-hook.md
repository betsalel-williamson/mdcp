---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
---

Implement the `codeEvidence` compile hook: resolve evidence links to GitHub `#L` line fragments (from link labels, URL fragments, or line-range text), rebase paths relative to the rendered output (per-guide `compile.outputFile` or monolith path), and use `compile.scopeRoot` for cross-tree file lookup.

Export `resolveGuideLinkBase`. Remove unused `hooksConfig.codeEvidence.searchRoots` — shard-relative paths and `compile.scopeRoot` cover the same cases with less config.
