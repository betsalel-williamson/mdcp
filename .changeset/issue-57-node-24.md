---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
'@bwilliamson/mdcp-presets': patch
---

Require Node.js **>= 24.0.0** (#57). Node 22 is no longer supported; upgrade your runtime before updating these packages.

Also: move pnpm-only settings to `pnpm-workspace.yaml` (silences npm 11 warnings), document `npx @bwilliamson/mdcp-cli` for day-zero fetch, and follow GitHub raw symlink targets when fetching llms-index from tagged releases (e.g. v0.4.0 `valpha`).
