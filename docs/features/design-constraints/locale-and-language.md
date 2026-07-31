# Locale and language boundary

MDCP treats **authored [GFM](../../glossary/gfm.md)** as the format contract. Natural-language **static analysis** (grammar cues, unlinked chapter-style phrases, style-guide tone) **belongs with** **[Vale](https://vale.sh/) style packages**, not as durable gates in the core compile/check API. Core may hold a small **[locale pack](../../glossary/locale-pack.md)** for compile-time generated wording (captions, broken-link markers).

## Preferred homes

- **Unlinked chapter-style cues** (bare Ch. / chapter phrases) → peer **Vale** style in `@bwilliamson/mdcp-presets` (`vale/MDCP`).
- **Style-guide tone, spelling, wordiness** → peer **Vale** (Microsoft, custom `En`, …). Multi-language via style packs + glob sections.
- **Dead internal targets, orphans, refs, compile** → **mdcp-core / CLI**. First-class [MarkDown Context Protocol](../../glossary/mdcp.md) validation.
- **GFM / Markdown shape** → peer **markdownlint**. Format structure, not natural language.
- **Generated caption / marker copy** (`Table 1. …`, `BROKEN LINK`) → compile-time locale pack (default `en-US`). Product output strings — not lint alerts.

Example: a chapter-style mention with no markdown link should raise a **Vale** alert with a clear instruction (and optional `link:` to docs) — do **not** grow a parallel English regex linter inside `mdcp check` as the durable design. That couples prose opinion to Vale (which already owns style packages) and keeps the CLI surface focused on protocol concerns.

```text
# Illustrative bad cue (handle in Vale, not core):
See Chapter 2 for details.
```

Chapter-cue prose rules live in the shippable **`MDCP` Vale style** in [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) (`vale/MDCP/`; consumers enable it from `.vale.ini`).

## How Vale handles multiple languages (model we follow)

[Vale](https://vale.sh/) (see [errata-ai/vale](https://github.com/errata-ai/vale) and [styles](https://github.com/errata-ai/styles)) does **not** fork its Markdown engine per language. Multi-language docs repos use three pieces:

1. **Markup / format engine** — scopes, ignores, and format parsers stay language-neutral. That maps to MDCP’s GFM helpers and peer markdownlint.
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

   Path sections work the same way (`[en/docs/*.md]`, `[fr/docs/*.md]`). Official packages such as **Microsoft** are English style-guide implementations — another language gets another style package, not a different Markdown parser. An MDCP-owned style (for example bare cross-ref cues) is the same kind of package.

3. **Locale-named dictionaries** — Hunspell-compatible `en_US.{dic,aff}` under `styles/config/dictionaries/`, selected from `spelling` rules.

## Default and extension

Compile-time locale packs default to **`en-US`**. Prose lint for other languages is a Vale style + `.vale.ini` section — not new branches inside GFM helpers or the check pipeline.

Insert **library directory names** (`diagrams/`, `tables/`, …) stay English path identifiers for now; only user-visible caption and marker **wording** goes through the locale pack.

## Related

- [GFM scope](./gfm-scope.md) — format limits (no Pandoc/LaTeX/wikilinks)
- [Peer linters](./peer-linters.md) — markdownlint and Vale stay opt-in peers
- [Optional linters](../../client-cli/optional-linters.md) — CLI wiring and scan scope
- [Link validation](../link-validation.md) — first-class internal target checks (not Vale)
- Vale docs: [BasedOnStyles](https://vale.sh/docs/keys/basedonstyles), [spelling / dictionaries](https://vale.sh/docs/checks/spelling), [Hunspell](https://vale.sh/docs/guides/hunspell)
