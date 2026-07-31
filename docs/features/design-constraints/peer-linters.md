# Peer linters

markdownlint-cli2, Vale, Prettier, markdown-link-check are **not bundled**.

Detection order: `node_modules/.bin` → PATH → skip with info.

Use `--require-lint` / `--require-vale` in CI.

**Separation of concerns:** markdownlint covers **GFM / Markdown structure**. Vale styles cover **locale / prose static analysis** (style guides, spelling, unlinked chapter-style cues). Prefer shipping MDCP prose opinion as a Vale style package consumers enable — not as more regex gates inside `mdcp check`. Core stays on protocol validation (orphans, refs, internal links, compile). See [Locale and language boundary](./locale-and-language.md).
