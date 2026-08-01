# Local Vale dogfood styles

This directory holds committed Vale style source for rules that are local to the mdcp repository. Root `pnpm vale:sync` links these styles into `docs/styles/` and `examples/sample-guides/styles/` next to the shipped `MDCP` preset style.

Keep reusable rule logic in `@bwilliamson/mdcp-presets`. Local styles should stay small and dogfood-only.

`MDCP-PandocId` warns on Pandoc IDs (`{#…}`) after headings. The shipped `MDCP` style covers unlinked numbered heading mentions in prose. See [Locale and language boundary](../features/design-constraints/locale-and-language.md).
