# Locale and language boundary

MDCP treats **authored [GFM](../../glossary/gfm.md)** as the format contract and **[locale packs](../../glossary/locale-pack.md)** as the place for natural-language opinion. Do not mix US-English prose cues into GFM structural helpers.

## Two layers

| Layer               | Responsibility                                                                                             | Lives in / configured by                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **GFM / structure** | ATX headings, anchors, links, slugs, guide assembly, markdownlint shape rules                              | `mdcp-core` `markdown/`, `links/`, `compile/`, `refs/` (slug algorithm); peer **markdownlint** |
| **Locale / prose**  | Bare cross-ref cues (`See`, `Chapter`), broken-link marker copy, insert caption wording, style-guide prose | `mdcp-core` `locale/en-US/`; peer **Vale** styles                                              |

Structural code may **consume** a locale pack. It must not hard-code English tokens for lint messages, caption titles, or xref patterns.

## Vale as the peer example

[Vale](https://vale.sh/) keeps format awareness (Markdown scopes) separate from **styles** and **dictionaries**. Styles are packages of language-opinionated rules (this repo’s dogfood uses the **Microsoft** package — US English). `.vale.ini` assigns styles per path glob (`BasedOnStyles`); other locales get other styles or empty prose packs, not a fork of the Markdown engine.

MDCP mirrors that split:

- Peer **markdownlint** ≈ GFM / Markdown structure
- Peer **Vale** ≈ host-chosen prose locales
- Built-in helpers that sound like English style rules belong in a **locale pack**, same idea as a Vale style folder — not beside ATX/slug parsers

## Default and extension

The reference implementation ships **`en-US`** as the default locale pack. Adding another language means a new pack behind the same interface (and, for peer prose, a Vale style + `.vale.ini` section) — not new branches inside GFM helpers.

Insert **library directory names** (`diagrams/`, `tables/`, …) stay English path identifiers for now; only user-visible caption and marker **wording** goes through the locale pack.

## Related

- [GFM scope](./gfm-scope.md) — format limits (no Pandoc/LaTeX/wikilinks)
- [Peer linters](./peer-linters.md) — markdownlint and Vale stay opt-in peers
- [Optional linters](../../client-cli/optional-linters.md) — CLI wiring and scan scope
