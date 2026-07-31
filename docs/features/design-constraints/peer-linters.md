# Peer linters

markdownlint-cli2, Vale, Prettier, markdown-link-check are **not bundled**.

Detection order: `node_modules/.bin` → PATH → skip with info.

Use `--require-lint` / `--require-vale` in CI.

markdownlint covers **GFM / Markdown structure**. Vale styles cover **locale / prose** (this repo’s dogfood Microsoft package is US English). Built-in opinionated English helpers follow the same split — see [Locale and language boundary](./locale-and-language.md).
