---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
---

Fix coverage scan to honor the repository-root `.gitignore` when `scan.root` is nested inside a git working tree (bounded by `.git`), and never climb parent directories for `.gitignore` when not inside git.
