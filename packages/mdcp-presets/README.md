# @bwilliamson/mdcp-presets

Starter **markdownlint-cli2** configs and a **Vale** style package (`MDCP`) for MarkDown Context Protocol consumer repos.

Install alongside `@bwilliamson/mdcp-cli` when you want `mdcp lint` / `mdcp prose` (or `mdcp check --require-lint` / `--require-vale`) without writing lint configs from scratch.

## Requirements

- Node.js **>= 18.0.0**
- `markdownlint-cli2` for structure lint
- [Vale](https://vale.sh/) on `PATH` for prose lint (peer binary; not an npm dependency)

## Install

```bash
npm install -D @bwilliamson/mdcp-presets markdownlint-cli2 @bwilliamson/mdcp-cli
```

## Markdownlint presets

| File                                            | Targets                                       | Intent                                                                                  |
| ----------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `markdownlint-shards.markdownlint-cli2.jsonc`   | Registered guide shard trees (scope from CLI) | Relaxed rules for shard authoring — each shard starts with `#`, duplicates are expected |
| `markdownlint-compiled.markdownlint-cli2.jsonc` | `guides.md` only                              | Stricter link rules (`MD052`, `MD053`) on the compiled monolith                         |

### Shard preset highlights

- ATX headings (`#`), 2-space list indent
- `MD001`, `MD013` (line length), `MD024` (duplicate headings), `MD041` (first line H1) disabled — mdcp compile handles structure
- `MD025` front-matter title disabled

### Compiled preset highlights

- Validates fragment and reference link integrity on `guides.md`
- Line-length and duplicate-heading rules stay relaxed (compile output differs from shard layout)

## Vale style (`MDCP`)

English (en-US) prose cues when docs **mention** a numbered heading (`Chapter` / `Section` / `Ch.` / `Sec.`) without a GFM markdown link. MDCP itself only models headings and links; this style is language-specific static analysis. Keep [mdcp-core](https://www.npmjs.com/package/@bwilliamson/mdcp-core) on compile and protocol validation (including link targets). See [Locale and language boundary](../../docs/features/design-constraints/locale-and-language.md).

| Path                 | Role                                            |
| -------------------- | ----------------------------------------------- |
| `vale/package/`      | Vale Packages-compatible layout for `vale sync` |
| `vale/MDCP/`         | Source Vale style rules                         |
| `vale/mdcp.vale.ini` | Sample `.vale.ini` snippet for consumers        |

### Enable with Vale Packages

Use `Packages` when consuming the MDCP Vale style as a release zip:

```ini
StylesPath = styles
MinAlertLevel = suggestion
Packages = https://github.com/betsalel-williamson/mdcp/releases/download/<tag>/mdcp-presets-vale.zip

[*.{md,mdx}]
BasedOnStyles = MDCP
TokenIgnores = (?s)\[.*?\]\(.*?\)
```

Then run:

```bash
vale sync
```

The package config enables `MDCP` and ignores already-linked GFM markdown tokens so labels such as `[Section 2](./other.md#section-2)` do not false-positive. Vale 3.15.1 syncs local directory packages such as `./node_modules/@bwilliamson/mdcp-presets/vale/package` as style files but moves the package `.vale.ini`, so use the fallback below for npm-directory installs in this version.

Merge with other Vale packages by listing each package and combining styles:

```ini
StylesPath = styles
MinAlertLevel = suggestion
Packages = Microsoft, https://github.com/betsalel-williamson/mdcp/releases/download/<tag>/mdcp-presets-vale.zip

[*.{md,mdx}]
BasedOnStyles = Microsoft, MDCP
TokenIgnores = (?s)\[.*?\]\(.*?\)
```

Shipped `MDCP` rules use `scope: ~heading` so ATX heading titles (which may contain the words Chapter/Section) are not matched. Dogfood `MDCP-PandocId` uses `scope: heading` for Pandoc IDs (`{#…}`).

Run prose checks with:

```bash
mdcp prose --require-vale
# or
mdcp check --require-vale
```

If your Vale setup cannot use `Packages`, or you are using the npm directory path on Vale 3.15.1, copy or symlink `node_modules/@bwilliamson/mdcp-presets/vale/MDCP` into your `StylesPath` and merge the `TokenIgnores` example from `vale/package/.vale.ini`.

## Wire markdownlint into `mdcp.config.json`

Point `lint.markdownlint` at the installed preset files:

```json
{
  "lint": {
    "markdownlint": {
      "shardsConfig": "node_modules/@bwilliamson/mdcp-presets/markdownlint-shards.markdownlint-cli2.jsonc",
      "compiledConfig": "node_modules/@bwilliamson/mdcp-presets/markdownlint-compiled.markdownlint-cli2.jsonc"
    }
  }
}
```

Then run:

```bash
mdcp lint --require-lint
# or
mdcp check --require-lint
```

`mdcp lint` runs the shards config first, recompiles, then runs the compiled config.

Shard lint scope comes from `compileOrder` guide directories (or `lint.markdownlint.shardsGlobs` in config) — the preset supplies rules and exclusions only, not file scope.

## Package exports

```text
@bwilliamson/mdcp-presets/markdownlint-shards.markdownlint-cli2.jsonc
@bwilliamson/mdcp-presets/markdownlint-compiled.markdownlint-cli2.jsonc
@bwilliamson/mdcp-presets/vale/mdcp.vale.ini
@bwilliamson/mdcp-presets/vale/MDCP/*
@bwilliamson/mdcp-presets/vale/package/.vale.ini
@bwilliamson/mdcp-presets/vale/package/styles/MDCP/*
```

markdownlint-cli2 expects a filesystem path in `--config`, so the `node_modules/...` form above is the usual approach. Vale can sync the packaged MDCP style from `node_modules/@bwilliamson/mdcp-presets/vale/package`.

## Customizing

Copy a preset into your repo and edit it, or extend via markdownlint-cli2's `extends` pattern / Vale rule toggles (`MDCP.BareChapterRef = NO`). The shipped presets are a starting point — tune rules to match your style guide.

## Related packages

| Package                                                                          | Use                                                 |
| -------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`@bwilliamson/mdcp-cli`](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)   | Runs these configs via `mdcp lint` and `mdcp check` |
| [`@bwilliamson/mdcp-core`](https://www.npmjs.com/package/@bwilliamson/mdcp-core) | Core compile and validation library                 |

## Example

See [examples/sample-guides/mdcp.config.json](../../examples/sample-guides/mdcp.config.json) in the mdcp repo (paths differ in the monorepo vs. a consumer install).

## License

MIT
