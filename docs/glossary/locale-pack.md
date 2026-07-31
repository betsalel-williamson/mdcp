# Locale pack

A **locale pack** is MDCP’s small bundle of natural-language strings and locale-specific patterns used when **compiling** docs (for example US-English insert captions like `Table 1. …`, `BROKEN LINK` marker copy, and optional heading-key patterns).

It is **not** [GFM](./gfm.md) structure. GFM helpers and slugify stay language-agnostic. Prose static analysis (unlinked numbered heading mentions, Pandoc `{#…}` authoring, tone, spelling) belongs in peer **[Vale](https://vale.sh/) style packages** — reusable en-US mention rules ship in [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) (`vale/MDCP/`) — see [Locale and language boundary](../features/design-constraints/locale-and-language.md).
