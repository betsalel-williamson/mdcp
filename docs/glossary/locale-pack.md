# Locale pack

A **locale pack** is MDCP’s bundle of natural-language strings and patterns for opinionated linting and compiled prose (for example US-English `See` / `Chapter` cross-ref cues, `BROKEN LINK` markers, and insert captions like `Table 1. …`).

It is **not** [GFM](./gfm.md) structure. Format parsing and link/slug mechanics stay locale-agnostic; they call into a pack when wording or language-specific patterns are required.

In [Vale](https://vale.sh/), the parallel is a **language-specific style package** (for example an `En` style next to a shared `General` style), assigned to files with `.vale.ini` glob or path sections, plus optional Hunspell dictionaries named by locale (`en_US`). See [Locale and language boundary](../features/design-constraints/locale-and-language.md).
