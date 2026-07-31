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

English (en-US) prose cues for MDCP docs — bare chapter-style cross-references that should be markdown links. This is the durable home for that opinion; keep [mdcp-core](https://www.npmjs.com/package/@bwilliamson/mdcp-core) focused on compile and protocol validation. See [Locale and language boundary](../../docs/features/design-constraints/locale-and-language.md).

| Path                 | Role                                     |
| -------------------- | ---------------------------------------- |
| `vale/MDCP/`         | Vale style package (YAML rules)          |
| `vale/mdcp.vale.ini` | Sample `.vale.ini` snippet for consumers |

### Enable in your docs tree

1. Put `MDCP` on your Vale `StylesPath` (copy or symlink `node_modules/@bwilliamson/mdcp-presets/vale/MDCP` next to other styles such as Microsoft).
2. Merge rules from `vale/mdcp.vale.ini` into your `.vale.ini` (or start from that file).

```ini
StylesPath = styles
MinAlertLevel = suggestion

[*.md]
BasedOnStyles = MDCP
# Ignore already-linked markdown so link labels do not false-positive:
TokenIgnores = (?s)\[.*?\]\(.*?\)
# Ignore ATX heading lines (chapter titles in headings are not bare cross-refs):
BlockIgnores = (?m)^#+ .*
```

Combine with other styles as needed: `BasedOnStyles = Microsoft, MDCP`.

Then:

```bash
mdcp prose --require-vale
# or
mdcp check --require-vale
```

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
```

markdownlint-cli2 expects a filesystem path in `--config`, so the `node_modules/...` form above is the usual approach. Vale needs the `MDCP` folder under `StylesPath`.

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
