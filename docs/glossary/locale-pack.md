# Locale pack

A **locale pack** is MDCP’s small bundle of natural-language strings used when **compiling** docs (for example US-English insert captions like `Table 1. …` and `BROKEN LINK` marker copy).

It is **not** [GFM](./gfm.md) structure, and it is **not** where prose static-analysis rules should live. Unlinked chapter-style cues, tone, and spelling belong in peer **[Vale](https://vale.sh/) style packages** (language-specific YAML rules with messages and optional doc links), assigned via `.vale.ini` — the same multi-language model Vale uses for docs repos. See [Locale and language boundary](../features/design-constraints/locale-and-language.md).
