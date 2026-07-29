---
'@bwilliamson/mdcp-core': patch
---

Bare sibling `.md` links from shards outside the guide directory now rewrite to in-document anchors during compile. Parent-traversal (`../`) links are left unchanged for cross-guide and `ignoreGuides` handling.
