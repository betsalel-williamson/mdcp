---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
---

Implement builtin compile hooks (`inlineDiagrams`, `codeEvidence`, `reviewLinks`) and wire previously schema-only config fields (`sectionsHeading`, `preambleSection`, `hooksConfig`, `splitLevel` for shard sources).

Fix CLI `--config` resolution to use the invocation directory instead of `--cwd`. Add `vale.strictMinAlertLevel` config and directory shard source support in `mdcp shard`.
