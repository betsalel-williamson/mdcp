---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
'@bwilliamson/mdcp-presets': patch
---

Scope shard markdownlint and Vale prose to registered guide shard trees only. `mdcp lint` and `mdcp check` pass `compileOrder` guide directories to markdownlint-cli2 instead of linting every `**/*.md` under `--cwd`. Add `lint.markdownlint.shardsGlobs` optional override and export `guideScanDirs` / `shardLintPaths` from core (xref scan delegates to the same helper). Remove the broad `**/*.md` glob from the shard preset — rules and exclusions only.

**Old behavior:** the shard preset linted all markdown under `--cwd`, including legacy flat docs outside guide trees. Consumers who relied on that must add explicit paths to `shardsGlobs` or run markdownlint separately.
