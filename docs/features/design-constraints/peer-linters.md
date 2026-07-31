# Peer linters

markdownlint-cli2, Vale, Prettier, markdown-link-check are **not bundled**.

Detection order: `node_modules/.bin` → PATH → skip with info.

Use `--require-lint` / `--require-vale` in CI.

**Separation of concerns:** markdownlint covers **GFM / Markdown structure** (presets ship those configs). Vale styles cover **prose / language** static analysis — MDCP’s en-US chapter-cue style lives in `@bwilliamson/mdcp-presets` (`vale/MDCP`), alongside optional host styles such as Microsoft. Prefer that package over durable regex gates inside `mdcp check`. Core stays on protocol validation (orphans, refs, internal links, compile) plus transitional xref lint until Vale parity — see [Locale and language boundary](./locale-and-language.md).
