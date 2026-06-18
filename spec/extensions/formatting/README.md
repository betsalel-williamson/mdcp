# Formatting extensions

Placeholder for **lint and style packs** aligned to doc frameworks (Docusaurus admonitions, MkDocs tab syntax, Vale vocabularies per industry).

## Status

V1 documents the slot; concrete preset packages ship as extensions over time. Consumer repos today wire `lint.markdownlint` and `vale` paths in `mdcp.config.json` — read [config essentials](../../../docs/client-cli/config-essentials.md).

## Contributing a formatting pack

1. Add a subdirectory with preset files (`.jsonc`, `.vale.ini` fragments, README).
2. Document which `mdcp.config.json` keys to set.
3. Keep packs **optional** — core `mdcp check` must pass without them.
