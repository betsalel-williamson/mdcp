# Local Vale dogfood styles

This directory holds committed Vale style source for rules that are local to the mdcp repository. Root `pnpm vale:sync` links these styles into `docs/styles/` and `examples/sample-guides/styles/` next to the shipped `MDCP` preset style.

Keep reusable rule logic in `@bwilliamson/mdcp-presets`. Local styles should stay small and dogfood-only: they can point maintainers to repository-specific guidance or trial complementary checks before a rule belongs in the preset package.

`MDCP-Xref` warns on Pandoc [xref](../glossary/xref.md) identifiers after headings (brace-hash `{#…}`). Authors should remove those markers; MDCP derives fragment targets from GFM heading text via GitHub-style [heading slugs](../glossary/heading-slug.md). The shipped `MDCP` style is separate: en-US prose cues when a numbered heading is _mentioned_ without a GFM [cross-link](../glossary/cross-link.md). See [Locale and language boundary](../features/design-constraints/locale-and-language.md).
