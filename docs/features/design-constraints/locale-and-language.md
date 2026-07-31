# Locale and language boundary

MDCP treats **authored [GFM](../../glossary/gfm.md)** as the format contract: **headings** and **links**, not chapters/sections as protocol concepts. Natural-language **static analysis** belongs with **[Vale](https://vale.sh/) style packages**, not as durable gates in the core compile/check API. Core may hold a small **[locale pack](../../glossary/locale-pack.md)** for compile-time generated wording (captions, broken-link markers) and locale-specific heading-key patterns.

## Preferred homes

- **Pandoc `{#…}` after a heading** (explicit xref identifiers) → peer **Vale**. Dogfood style `MDCP-Xref` warns authors to **remove** them. MDCP does not require or prefer explicit ids; compile may strip leftover markers for cleanup.
- **Unlinked numbered heading mentions in prose** (en-US words such as "See Chapter…", bare `Ch. N`, "Section N") → peer **Vale** style `MDCP` in `@bwilliamson/mdcp-presets` (`vale/MDCP`). Language-specific; other languages need their own styles.
- **Dead internal targets, orphans, refs, compile** → **mdcp-core / CLI**. First-class [MarkDown Context Protocol](../../glossary/mdcp.md) validation of GFM links and heading slugs.
- **GFM / Markdown shape** → peer **markdownlint**. Format structure, not natural language.
- **Generated caption / marker copy** (`Table 1. …`, `BROKEN LINK`) → compile-time locale pack (default `en-US`). Product output strings — not lint alerts.

MDCP **cross-references** are ordinary GFM links to heading slugs (for example `[Details](./other.md#details)`). Core [link validation](../link-validation.md) checks that those targets resolve. Vale does not replace that check: Vale asks prose _mentions_ to become links, or asks authors to drop Pandoc ids.

```text
# Illustrative — Vale MDCP (prose mention without a link):
See Chapter 2 for details.

# Illustrative — Vale MDCP-Xref (Pandoc id after heading; remove it):
## Details {#…}
```

## How Vale handles multiple languages (model we follow)

[Vale](https://vale.sh/) (see [errata-ai/vale](https://github.com/errata-ai/vale) and [styles](https://github.com/errata-ai/styles)) does **not** fork its Markdown engine per language. Multi-language docs repos use three pieces:

1. **Markup / format engine** — scopes, ignores, and format parsers stay language-neutral. That maps to MDCP’s GFM helpers (`src/markdown/`, slugify, links) and peer markdownlint.
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

   Path sections work the same way (`[en/docs/*.md]`, `[fr/docs/*.md]`). Official packages such as **Microsoft** are English style-guide implementations — another language gets another style package, not a different Markdown parser. An MDCP-owned prose style (unlinked heading mentions) is the same kind of package.

3. **Locale-named dictionaries** — Hunspell-compatible `en_US.{dic,aff}` under `styles/config/dictionaries/`, selected from `spelling` rules.

## Default and extension

Compile-time locale packs default to **`en-US`** (BCP 47 JSON + shared formatters). Prose lint for other languages is a Vale style + `.vale.ini` section — not new branches inside GFM helpers or the check pipeline.

GFM helpers and heading **slugify** stay language-agnostic: they operate on Unicode heading text and GitHub-style slug rules, not on English chapter vocabulary.

Insert **library directory names** (`diagrams/`, `tables/`, …) stay English path identifiers for now; only user-visible caption and marker **wording** goes through the locale pack.

## Related

- [GFM scope](./gfm-scope.md) — format limits (no Pandoc/LaTeX/wikilinks)
- [Peer linters](./peer-linters.md) — markdownlint and Vale stay opt-in peers
- [Optional linters](../../client-cli/optional-linters.md) — CLI wiring and scan scope
- [Link validation](../link-validation.md) — first-class internal target checks (not Vale)
- Vale docs: [BasedOnStyles](https://vale.sh/docs/keys/basedonstyles), [spelling / dictionaries](https://vale.sh/docs/checks/spelling), [Hunspell](https://vale.sh/docs/guides/hunspell)
