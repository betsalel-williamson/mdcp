# Formatting extensions (`format-*`)

Placeholder index for **lint and style packs** aligned to doc frameworks (Docusaurus admonitions, MkDocs tab syntax, Vale vocabularies per industry).

## Naming

Formatting packs use the **`format-`** prefix as top-level extension ids (flat directory, same as `prompts-*` and `arch-*`):

```text
spec/extensions/
  format/                    # this index (doc-only)
  format-docusaurus/         # future: versioned pack
    1.0.0/
      manifest.json
      README.md
  format-mkdocs/             # future
  format-vale-healthcare/    # future
```

## Status

Open alpha documents the slot; concrete preset packages ship as versioned extensions over time. Consumer repos today wire `lint.markdownlint` and `vale` paths in `mdcp.config.json` — read [config essentials](../../../docs/client-cli/config-essentials.md).

## Contributing a formatting pack

1. Add `spec/extensions/format-{name}/{version}/` with preset files (`.jsonc`, `.vale.ini` fragments, README), `manifest.json`, and a catalog entry.
2. Document which `mdcp.config.json` keys to set.
3. Keep packs **optional** — core `mdcp check` must pass without them.

## Related archetypes

- [arch-product-docs-site](../arch-product-docs-site/) — pairs formatting packs with client-guide + site publish workflow
- [arch-oss-library](../arch-oss-library/) — pointer shards; optional format pack for compiled README cross-links
