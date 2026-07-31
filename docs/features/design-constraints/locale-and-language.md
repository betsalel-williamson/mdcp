# Locale and language boundary

MDCP treats **authored [GFM](../../glossary/gfm.md)** as the format contract and **[locale packs](../../glossary/locale-pack.md)** as the place for natural-language opinion. Do not mix US-English prose cues into GFM structural helpers.

## Two layers

| Layer               | Responsibility                                                                                             | Lives in / configured by                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **GFM / structure** | ATX headings, anchors, links, slugs, guide assembly, markdownlint shape rules                              | `mdcp-core` `markdown/`, `links/`, `compile/`, `refs/` (slug algorithm); peer **markdownlint** |
| **Locale / prose**  | Bare cross-ref cues (`See`, `Chapter`), broken-link marker copy, insert caption wording, style-guide prose | `mdcp-core` `locale/en-US/`; peer **Vale** styles                                              |

Structural code may **consume** a locale pack. It must not hard-code English tokens for lint messages, caption titles, or xref patterns.

## How Vale handles multiple languages (model we follow)

[Vale](https://vale.sh/) (see [errata-ai/vale](https://github.com/errata-ai/vale) and [styles](https://github.com/errata-ai/styles)) does **not** fork its Markdown engine per language. Multi-language docs repos use three pieces:

1. **Markup / format engine** — scopes, ignores, and format parsers stay language-neutral (Markdown vs AsciiDoc, code fences, headings). That maps to MDCP’s GFM helpers and peer markdownlint.
2. **Style packages** — folders of YAML rules under `StylesPath`. Maintainer guidance for mixed-language trees is to split **shared** rules from **language-specific** ones (for example `General` + `En`), then assign them with `.vale.ini` **glob sections**:

   ```ini
   StylesPath = styles
   MinAlertLevel = suggestion

   # English (or default) docs: shared + English grammar/style
   [*.md]
   BasedOnStyles = General, En

   # Translations: shared only (or General + Fr, …)
   [*.{de,es,fr,it,ja,ru}.md]
   BasedOnStyles = General
   ```

   Path sections work the same way (`[en/docs/*.md]`, `[fr/docs/*.md]`). The most specific matching section’s `BasedOnStyles` **replaces** less-specific ones; list every style you still want. Official packages such as **Microsoft** are English style-guide implementations — another language gets another style package, not a different Markdown parser.

3. **Locale-named dictionaries** — Hunspell-compatible `en_US.{dic,aff}` (and peers) under `styles/config/dictionaries/`, selected from `spelling` rules. Morphology and spelling are per-locale data files, not core engine branches.

MDCP’s built-in opinionated English helpers follow the same idea as a Vale **`En` / `en-US` style package**: ship them as `locale/en-US/`, keep GFM structure elsewhere, and add `locale/fr-FR/` (plus a Vale style + `.vale.ini` section for peer prose) when a second language is needed.

## Default and extension

The reference implementation ships **`en-US`** as the default locale pack. Adding another language means a new pack behind the same interface — and, for peer prose, a Vale style package plus a glob/path section in `.vale.ini` — not new branches inside GFM helpers.

Insert **library directory names** (`diagrams/`, `tables/`, …) stay English path identifiers for now; only user-visible caption and marker **wording** goes through the locale pack.

## Related

- [GFM scope](./gfm-scope.md) — format limits (no Pandoc/LaTeX/wikilinks)
- [Peer linters](./peer-linters.md) — markdownlint and Vale stay opt-in peers
- [Optional linters](../../client-cli/optional-linters.md) — CLI wiring and scan scope
- Vale docs: [BasedOnStyles](https://vale.sh/docs/keys/basedonstyles), [spelling / dictionaries](https://vale.sh/docs/checks/spelling), [Hunspell](https://vale.sh/docs/guides/hunspell)
