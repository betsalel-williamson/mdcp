# Markdown formatting

## Base Requirement

When contributing documentation, rely on **simple [GFM](../glossary/gfm.md) (GitHub Flavored Markdown)** as the standard. MDCP knows headings and links — not chapters/sections as protocol concepts.

## Open Structure

We use an unopinionated, flexible document structure. The goal is to keep the authoring experience simple and accessible. You do not need to adhere to complex metadata schemas or strict structural hierarchies when writing documentation shards.

## Strict Link Validity

While we are unopinionated about document structure, we are **strict about links**.

- All links in your documentation must be valid and point to existing files or headings ([cross-links](../glossary/cross-link.md)).
- Prefer GitHub-style [heading slugs](../glossary/heading-slug.md) from heading text. Do **not** author Pandoc [xref](../glossary/xref.md) identifiers (`{#…}` after a heading).
- If a link is invalid, the CI and documentation checks will fail.
- Do not create links to files that do not exist yet. If you need to indicate a placeholder, comment it out or write `(TBD)`.

For more details on the link validation rules, please consult the [Format specification](../features/protocol/format-specification.md).

## Formatting and Linting

To help avoid formatting errors and enforce consistent style, we recommend using `@bwilliamson/mdcp-presets`. These presets configure tools like Prettier and `markdownlint-cli2` to handle whitespace, indentation, and common styling issues automatically. For configuration details, see [Optional Linters](../client-cli/optional-linters.md).

This repository also enables Vale styles:

- **`MDCP`** (from presets) — en-US prose when a numbered heading is mentioned without a GFM link
- **`MDCP-Xref`** (dogfood, [`docs/vale-local/`](../vale-local/README.md)) — warn to remove Pandoc [xref](../glossary/xref.md) markers on headings

See [Locale and language boundary](../features/design-constraints/locale-and-language.md) and [Docs dogfooding](./docs-dogfooding.md).

---

_Note: GitHub and GitHub Flavored Markdown are trademarks of GitHub, Inc. This project is not affiliated with, sponsored by, or endorsed by GitHub, Inc._
