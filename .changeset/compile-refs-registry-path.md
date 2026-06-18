---
'@bwilliamson/mdcp-cli': patch
---

Fix `mdcp compile` so it writes `refs.json` under `outputDir` (via `refs.registryFile`) instead of omitting the registry when guides use nested `compile.outputFile` paths. `mdcp refs list` now works immediately after compile.

Closes #62
