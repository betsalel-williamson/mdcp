# Locale pack

A **locale pack** is MDCP’s bundle of natural-language strings and patterns for opinionated linting and compiled prose (for example US-English `See` / `Chapter` cross-ref cues, `BROKEN LINK` markers, and insert captions like `Table 1. …`).

It is **not** [GFM](./gfm.md) structure. Format parsing and link/slug mechanics stay locale-agnostic; they call into a pack when wording or language-specific patterns are required. Peer [Vale](https://vale.sh/) styles play the same role for host prose lint — separate from markdownlint’s Markdown rules.

See [Locale and language boundary](../features/design-constraints/locale-and-language.md).
