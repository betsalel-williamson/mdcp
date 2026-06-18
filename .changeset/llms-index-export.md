---
'@bwilliamson/mdcp-cli': major
'@bwilliamson/mdcp-core': major
'@bwilliamson/mdcp-presets': major
---

Add `mdcp export --llms-index` to generate a versioned agent bootstrap file (`mdcp.v1.llms.txt`, protocol 1.0.0.0) in the docs root. Config gains `protocolVersion`, `export.llmsIndex.outputFile`, and `export.llmsIndex.upstream` (default GitHub source for `--fetch`).

`mdcp export --llms-index --fetch` pulls the canonical bootstrap from `spec/llms-index/` on GitHub — default `vstable` (adopted), `vdev` (draft), or `--fetch-ref` for pinned tags. Config: `export.llmsIndex.upstream` (`repo`, `ref`, `profile`). Draft files use `mdcp.v{n}--draft.llms.txt` until adopted.

Part of the **1.0.0** first stable API release — see `.changeset/v1-stable-api-release.md`.
