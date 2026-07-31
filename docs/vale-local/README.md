# Local Vale dogfood styles

This directory holds committed Vale style source for rules that are local to the mdcp repository. Root `pnpm vale:sync` links these styles into `docs/styles/` and `examples/sample-guides/styles/` next to the shipped `MDCP` preset style.

Keep reusable rule logic in `@bwilliamson/mdcp-presets`. Local styles should stay small and dogfood-only: they can point maintainers to repository-specific guidance or trial complementary checks before a rule belongs in the preset package.

`MDCP-Xref` reinforces the GFM-only cross-reference boundary for this repository. The shipped `MDCP` style owns the en-US rules for unlinked chapter and section cues; `MDCP-Xref` adds a local reminder for plural or compound heading cues and links authors to [Locale and language boundary](../features/design-constraints/locale-and-language.md). Other languages need their own Vale styles and `.vale.ini` sections.
