---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
---

Fix coverage scan to walk up from `scan.root` and honor an ancestor repository `.gitignore` (so nested docs roots skip gitignored paths like `.caches/`).
