---
'@bwilliamson/mdcp-core': major
'@bwilliamson/mdcp-cli': major
'@bwilliamson/mdcp-presets': major
---

Add opt-in compile output backup before overwrite.

**Added:**

- Global `--backup`, `--backup-dir`, and `--backup-ext` CLI flags
- Optional top-level `backup` config object (`enabled`, `dir`, `ext`) — CLI flags override config
- `writeOutputFile` in `@bwilliamson/mdcp-core` — when enabled, moves existing compile or export targets to `{outputDir}/.caches/backups/` (docsRoot-relative mirror path) before writing

Default behavior is unchanged: `mdcp compile` and `mdcp export` overwrite existing output files. Use `--backup` or `backup.enabled` when working outside version control or before overwriting publish paths such as `README.md`.
