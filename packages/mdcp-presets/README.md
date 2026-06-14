# @bwilliamson/mdcp-presets

Starter [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) configs tuned for **mdcp** consumer repos — separate rules for **shard files** and the **compiled monolith**.

Install alongside `@bwilliamson/mdcp-cli` when you want `mdcp lint` or `mdcp check --require-lint` without writing lint configs from scratch.

## Requirements

- Node.js **>= 22.12.0**
- `markdownlint-cli2` installed in your repo

## Install

```bash
npm install -D @bwilliamson/mdcp-presets markdownlint-cli2 @bwilliamson/mdcp-cli
```

## Presets

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

## Wire into `mdcp.config.json`

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

The preset files are also exposed as subpath exports if your tooling resolves them:

```text
@bwilliamson/mdcp-presets/markdownlint-shards.markdownlint-cli2.jsonc
@bwilliamson/mdcp-presets/markdownlint-compiled.markdownlint-cli2.jsonc
```

markdownlint-cli2 expects a filesystem path in `--config`, so the `node_modules/...` form above is the usual approach.

## Customizing

Copy a preset into your repo and edit it, or extend via markdownlint-cli2's `extends` pattern. The shipped presets are a starting point — tune rules to match your style guide.

For prose linting (Vale), configure `vale` in `mdcp.config.json` separately; Vale is not part of this package.

## Related packages

| Package                                                                          | Use                                                 |
| -------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`@bwilliamson/mdcp-cli`](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)   | Runs these configs via `mdcp lint` and `mdcp check` |
| [`@bwilliamson/mdcp-core`](https://www.npmjs.com/package/@bwilliamson/mdcp-core) | Core compile and validation library                 |

## Example

See [examples/sample-guides/mdcp.config.json](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json) in the mdcp repo (paths differ in the monorepo vs. a consumer install).

## License

MIT
