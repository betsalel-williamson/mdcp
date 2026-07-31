# Locale pack

A **locale pack** is MDCP’s small bundle of natural-language strings used when **compiling** docs (for example US-English insert captions like `Table 1. …` and `BROKEN LINK` marker copy).

It is **not** [GFM](./gfm.md) structure. Prose static analysis (unlinked chapter-style cues, tone, spelling) belongs in peer **[Vale](https://vale.sh/) style packages** — MDCP’s chapter-cue style ships in [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) (`vale/MDCP/`) — see [Locale and language boundary](../features/design-constraints/locale-and-language.md).

**As built today:** the default pack may also supply transitional pattern/message strings for built-in `lintXrefs` until those cues move to a Vale style. Shrink the pack to compile-time copy when that parity exists.
