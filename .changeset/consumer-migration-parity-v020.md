---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
---

Compound consumer migration parity release (closes #19).

**Breaking changes:**

- `outputDir` default `.` → `_build`
- Guide shard dir `{outputDir}/{name}` → `{docsRoot}/{name}`
- Default compile output: monolith `guides.md` → per-guide `{name}.md` (or `guide.md` when one guide)
- Monolith is opt-in via top-level `outputFile`
- `refs.registryFile` default `refs.json` → `.caches/refs.json`
- CLI `--cwd` removed; use `--docs-root`
- `mdcp sections` and `sections.txt` removed — compile order from manifest links (`compile.sectionsHeading` when needed)
- All generated paths resolve under `outputDir` unless absolute

**Added:**

- Compile hooks: `inlineInserts` (diagram/table/figure inlining), `codeEvidence`, `reviewLinks` with cross-guide link rewriting
- In-scope shard lint and Vale prose (`guideScanDirs`, optional `lint.markdownlint.shardsGlobs`)
- `vale.strictMinAlertLevel` config; directory shard source support in `mdcp shard`

**Fixed:**

- CLI `--config` resolves from invocation directory, not docs root
- `refs.registryFile` no longer double-joined with `outputDir`
- Blank line after injected compile title

**Migration:** preserve pre-0.2.0 layout with explicit `"outputDir": "."`, `"outputFile": "guides.md"`, `"refs": { "registryFile": "refs.json" }`. See `docs/client-cli/consumer-migration.md`.
