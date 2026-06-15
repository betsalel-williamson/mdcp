# Peer linters

markdownlint-cli2, Vale, Prettier, markdown-link-check are **not bundled**.

Detection order: `node_modules/.bin` → PATH → skip with info.

Use `--require-lint` / `--require-vale` in CI.
