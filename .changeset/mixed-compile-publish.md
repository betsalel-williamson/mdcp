---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
---

Support mixed monolith and per-guide publish outputs: guides with `compile.outputFile` write to a separate path and are excluded from the monolith; guides without `outputFile` still compile into `guides.md`. Add optional `compile.includeBanner` per guide (defaults to false when `outputFile` is set).
