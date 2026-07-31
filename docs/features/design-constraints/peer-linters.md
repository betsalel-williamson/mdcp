# Peer linters

markdownlint-cli2, Vale, Prettier, markdown-link-check are **not bundled**.

Detection order: `node_modules/.bin` → PATH → skip with info.

Use `--require-lint` / `--require-vale` in CI.

**Separation of concerns:** markdownlint covers **GFM / Markdown structure**. Vale styles cover **prose / language** static analysis (style guides, spelling, unlinked chapter-style cues). Prefer shipping MDCP prose opinion as a Vale style package consumers enable — not as more durable regex gates inside `mdcp check`. Core stays on protocol validation (orphans, refs, internal links, compile) plus transitional xref lint until Vale parity — see [Locale and language boundary](./locale-and-language.md).
