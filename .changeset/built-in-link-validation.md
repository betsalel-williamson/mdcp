---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
'@bwilliamson/mdcp-presets': minor
---

Add built-in internal link validation with BROKEN LINK markers, publish-only link policy, and publish-relative path rewriting.

**Added:**

- First-party link validation in `@bwilliamson/mdcp-core` — dead `.md` paths and `#anchor` fragments caught at shard and compiled-guide level
- **`BROKEN LINK`** markers in compiled output by default (`compile.links.markBroken`) — visible prose with original shard target and broken resolved target instead of silent dead links
- Built-in link gate in `mdcp check` (after refs, before xrefs) — enabled by default (`lint.links.enabled`)
- Non-zero exit codes on broken links for `mdcp compile` and `mdcp check` — CI pipelines halt before downstream steps
- Global `--warn-broken-links` flag and `lint.links.severity: "warn"` config — report `link-warn:` diagnostics but exit 0
- **Publish-only link policy** — guides with `compile.outputFile` reject `.md` links into shard trees for unpublished guides or guides listed in `compile.crossGuideLinks.ignoreGuides` (`missing publish path`), even when the href resolves on disk
- **Publish-relative link rewriting** — per-shard `rewritePublishRelativeLinks` rebases remaining `../` file links from `sourceFile` to paths relative to the publish output (replaces bulk `publishPathRewrite` string substitution)
- Manifest-first guide link index ownership — cross-guide shards attributed to owning guide, fixing publish-path rewrite collisions
- Cross-publish README validation — when multiple publish outputs share `README.md`, fragment matching disambiguates sibling package links (e.g. `../mdcp-core/README.md#cross-guide-link-rewriting`)

**Changed (pre-1.0 API):**

- Remove `compile.publishPathRewrite` — geometry now comes from per-shard resolution against `compile.outputFile`
- `mdcp check` now fails on dead internal links without requiring `markdown-link-check` or `lint.links.config`
- `mdcp compile` exits 1 when broken links are present unless `--warn-broken-links` or `lint.links.severity: "warn"`
- Repo dogfood: published guides (`developer`, `client-cli`, `client-core`) use `crossGuideLinks.ignoreGuides: ["features"]` so cross-guide links keep shard paths; publish-relative rewrite rebases geometry; lint flags disallowed shard targets for human review

Peer `mdcp links` / `markdown-link-check` remains optional for external URL HTTP checks. Opt out of the built-in gate with `lint.links.enabled: false`.
