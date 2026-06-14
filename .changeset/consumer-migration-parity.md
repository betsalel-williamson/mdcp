---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
---

Implement builtin compile hooks (`inlineDiagrams`, `codeEvidence`, `reviewLinks`) and wire previously schema-only config fields (`sectionsHeading`, `preambleSection`, `hooksConfig`, `splitLevel` for shard sources).

Remove `sections.txt` and the `mdcp sections` command — compile order is derived from `index.md` / `shards.md` link order (use `compile.sectionsHeading` when the manifest has preamble links outside the section list).

**Migration from older releases:** delete committed `sections.txt` files under guide directories; remove `mdcp sections` from npm scripts; add `compile.sectionsHeading` where manifests mix preamble example links with a `## Sections` list.

Fix CLI `--config` resolution to use the invocation directory instead of `--cwd`. Add `vale.strictMinAlertLevel` config and directory shard source support in `mdcp shard`.
