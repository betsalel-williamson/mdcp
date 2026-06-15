---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
'@bwilliamson/mdcp-presets': minor
---

Add built-in internal link validation with BROKEN LINK markers in compiled output.

**Added:**

- First-party link validation in `@bwilliamson/mdcp-core` — dead `.md` paths and `#anchor` fragments caught at shard and compiled-guide level
- **`BROKEN LINK`** markers in compiled output by default (`compile.links.markBroken`) — visible prose with original shard target and broken resolved target instead of silent dead links
- Built-in link gate in `mdcp check` (after refs, before xrefs) — enabled by default (`lint.links.enabled`)
- Non-zero exit codes on broken links for `mdcp compile` and `mdcp check` — CI pipelines halt before downstream steps
- Global `--warn-broken-links` flag and `lint.links.severity: "warn"` config — report `link-warn:` diagnostics but exit 0
- Manifest-first guide link index ownership — cross-guide shards attributed to owning guide, fixing publish-path rewrite collisions

**Changed:**

- `mdcp check` now fails on dead internal links without requiring `markdown-link-check` or `lint.links.config`
- `mdcp compile` exits 1 when broken links are present unless `--warn-broken-links` or `lint.links.severity: "warn"`

Peer `mdcp links` / `markdown-link-check` remains optional for external URL HTTP checks. Opt out of the built-in gate with `lint.links.enabled: false`.
