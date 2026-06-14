# Optional linters

These commands use tools installed in **your** repo (not bundled with mdcp):

| Command      | Peer tool                       | Purpose                                                                        |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------ |
| `mdcp lint`  | `markdownlint-cli2`             | Lint shards and compiled output                                                |
| `mdcp prose` | `vale` (`@vvago/vale`)          | Prose style lint                                                               |
| `mdcp links` | `markdown-link-check`           | Check links in compiled output (`lint.links` config required in `check`)       |
| `mdcp fix`   | `prettier`, `markdownlint-cli2` | Run `prettier --write .` then `markdownlint-cli2 --fix` (no mdcp config paths) |

`mdcp fix` does not bundle formatters. Install **Prettier** and **markdownlint-cli2** in your repo first (`node_modules/.bin` or PATH). Each step is skipped with an info message if the peer is missing.

```bash
mdcp lint --require-lint          # fail if markdownlint-cli2 is missing
mdcp prose --require-vale         # fail if Vale is missing
mdcp check --require-lint --require-vale   # CI gate with markdownlint + Vale
mdcp check --skip-vale            # structural checks only
```

`mdcp check` runs link checking only when **`lint.links.config`** is set in `mdcp.config.json` and `markdown-link-check` is installed. `mdcp links` always skips quietly if the peer is missing.

Install peers with:

```bash
npm install -D prettier markdownlint-cli2 @vvago/vale @bwilliamson/mdcp-presets
```

Wire preset paths in `mdcp.config.json` under `lint.markdownlint`. See `@bwilliamson/mdcp-presets` on npm.
