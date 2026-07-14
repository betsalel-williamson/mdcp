---
'@bwilliamson/mdcp-cli': minor
'@bwilliamson/mdcp-core': minor
---

Remove `mdcp refs lookup` and the `lookupHeadings` export. Discover shards with host search; validate cross-links with `mdcp check` / `refs list`. This is a breaking change for callers of the removed API.
