---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
'@bwilliamson/mdcp-presets': minor
---

## 0.4.0 — first open alpha

First public alpha release for external testers. MDCP is pre-1.0: **no API stability guarantee** — pin `@bwilliamson/mdcp-cli@0.4.0` and read changelogs before upgrading.

**Since 0.3.0 (breaking changes allowed in 0.x):**

- Built-in link validation, BROKEN LINK markers, publish-relative rewriting, GitHub slug algorithm
- Cross-guide link assembly via `compile.crossGuideLinks.ignoreGuides` (replaces `reviewLinks` hook)
- Unified output layout (`--docs-root`, `_build`, per-guide outputs)
- Sharded glossary manifest and compile scope behavior
- `mdcp export --llms-index` and `--fetch` for versioned agent bootstrap
- Opt-in compile output backup (`--backup`, `backup` config)

**Protocol:** npm 0.4.0 implements the **draft** protocol profile (`0.4.0.0`, `mdcp.v0.4.llms.txt`). First published llms-index spec. Pre-0.4 doc-style and compile evolution is recorded in this release batch's sibling changesets (`.changeset/*.md`) and existing package changelogs — not in prior `spec/llms-index/` artifacts. Use `mdcp export --llms-index --fetch --fetch-profile dev` for the in-progress bootstrap. Stable artifact promotion waits for npm 1.0.0.

**Removed config fields (0.4.0 alpha):** `protocol.fetch`, `protocol.source`, `export.llmsIndex.upstream`, `export.llmsIndex.outputFile`, `extensions.protocolVersion`, `extensions.defaultSource` → flat `protocol.profile` / `protocol.ref` (+ optional `repo`, `path`, `protocol.llmsIndex.outputFile`). Extension manifests: `minProtocolVersion` / `maxProtocolVersion` → `protocolVersionRange` only.

Feedback welcome via GitHub Issues before the 1.0 stable release.
