---
'@bwilliamson/mdcp-cli': minor
'@bwilliamson/mdcp-core': minor
---

Unified NPM-style output layout: default `outputDir` is `_build`; guide shards live at `{docsRoot}/{name}/`; per-guide compile outputs default to `{name}.md` (or `guide.md` when one guide); monolith is opt-in via top-level `outputFile`; refs registry defaults to `.caches/refs.json`; all generated paths resolve under `outputDir` unless absolute. CLI adds `--docs-root` (`--cwd` deprecated alias). Removes dual-base `..` → docs-root heuristic from #18.
