---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
---

Join bare `compile.outputFile` values under `outputDir` (same normalization as monolith `outputFile` and `refs.registryFile`). Paths with `..` still resolve from `--cwd` for repo publish targets (npm READMEs, `DEVELOPERS.md`).

**Previously:** `"compile": { "outputFile": "glossary.md" }` with `"outputDir": "_build/compiled"` wrote `<cwd>/glossary.md`. **Now:** it writes `<cwd>/_build/compiled/glossary.md`. Explicit cwd paths like `"_build/compiled/glossary.md"` normalize to the same location. Workaround paths remain valid; bare filenames are preferred with nested `outputDir`.

Export `resolveGuideOutputPath` from `@bwilliamson/mdcp-core`.
