---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
---

Added `sourceTags` to `MdcpConfigSchema` (defaults to `true`) to wrap compiled shards in HTML comments indicating their source path. Source tags are emitted with a blank line before the closing tag so compiled output stays Prettier-stable, and can be disabled per guide via `compile.sourceTags: false`.
Updated `banner` to default to a warning message, and enabled it by default for all compiled outputs (`compile.includeBanner` still overrides per guide).
