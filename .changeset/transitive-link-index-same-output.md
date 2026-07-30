---
'@bwilliamson/mdcp-core': patch
---

Index every `linkedSectionFiles` path (including transitive `scopeRoot` shards outside `guideDir`) and prefer same-output `#anchor` rewrite for non-canonical co-compiled targets so `../` links under default `_build` outputs resolve correctly.
