---
'@bwilliamson/mdcp-core': patch
---

Remove bare digit-range matching from `lineRangeFromText` — `1-2` no longer produces `#L1-L2`. An explicit prefix (`L`, `:`, or a locale word cue) is required to avoid ambiguity with non-line-range number ranges.
