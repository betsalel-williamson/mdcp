---
'@bwilliamson/mdcp-core': major
'@bwilliamson/mdcp-cli': major
'@bwilliamson/mdcp-presets': major
---

Sharded glossary layout and compile manifest scope behavior (docs dogfood; protocol 1.0 glossary profile).

**Changed:**

- `compile.scopeRoot` limits **transitive** shard crawl only — it no longer filters manifest links on the compiling guide's own `index.md`
- Co-compiled glossary shards: `rewriteIntraGuideFileLinks` resolves same-output `.md` links by shard basename (e.g. `./gfm.md` → `#gfm` when glossary terms are stitched into a publish output)

**Docs:**

- Glossary terms are one shard per entry; sub-index manifests (`index-protocol.md`, `index-format.md`) group entries for large glossaries
- Guides that stitch glossary set `compile.scopeRoot: "glossary"` and link `../glossary/index.md` from the guide manifest
