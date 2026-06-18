---
'@bwilliamson/mdcp-cli': minor
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-presets': minor
---

Add `mdcp export --llms-index` to generate a versioned agent bootstrap file (`mdcp.v0.4.llms.txt`, protocol 0.4.0.0) in the docs root. Config gains `protocolVersion` and flat `protocol.profile` / `protocol.ref` (optional `protocol.repo`, `protocol.path`, `protocol.llmsIndex.outputFile`) for `--fetch`.

`mdcp export --llms-index --fetch` pulls the canonical bootstrap from `spec/llms-index/` on GitHub — `valpha` (open alpha), `vdev` (draft), or `--fetch-ref` for pinned tags. Draft files use `mdcp.v{n}--draft.llms.txt` until adopted. `vstable` is reserved for npm 1.0.0.

**Removed before 0.4.0 publish (no backward compat):** `protocol.fetch`, `protocol.source`, `export.llmsIndex.upstream`, `export.llmsIndex.outputFile`, `extensions.protocolVersion`, `extensions.defaultSource` — use flat `protocol.*` fields and root `protocolVersion` instead.
