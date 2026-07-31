# Locale pack

A **locale pack** is MDCP’s small bundle of natural-language strings and locale-specific patterns used when **compiling** docs (for example US-English insert captions like `Table 1. …`, `BROKEN LINK` marker copy, and optional heading-key patterns in BCP 47 JSON).

It is **not** [GFM](./gfm.md) structure. GFM helpers and [heading slug](./heading-slug.md) generation stay language-agnostic under `src/markdown/` and `src/refs/`. Prose static analysis belongs in peer **[Vale](https://vale.sh/) style packages**:

- Unlinked numbered heading mentions (en-US) → `MDCP` in [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) (`vale/MDCP/`)
- Pandoc [xref](./xref.md) authoring → dogfood `MDCP-Xref` (remove those markers)

See [Locale and language boundary](../features/design-constraints/locale-and-language.md).
