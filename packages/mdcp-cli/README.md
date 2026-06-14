# @bwilliamson/mdcp-cli

## Install and quick start

**mdcp** splits, compiles, validates, and exports sharded Markdown documentation. You edit small shard files; mdcp weaves them into one compiled guide (`guides.md`) with correct heading levels, working cross-links, and structure checks.

This package installs the `mdcp` command for use in your repo or CI.

### Requirements

- Node.js **>= 22.12.0**

### Install

```bash
# Dev dependency (recommended)
npm install -D @bwilliamson/mdcp-cli

# Or run without installing
npx @bwilliamson/mdcp-cli check --config mdcp.config.json

# Global install
npm install -g @bwilliamson/mdcp-cli
```

### Stability

**Pre-1.0:** There is **no API stability guarantee** until **1.0.0**. CLI commands, flags, `mdcp.config.json` schema, and compile output may change in any `0.x.y` release. Pin a specific version and read package changelogs before upgrading.

Optional lint tooling (install in your repo when you want `mdcp lint`, `mdcp prose`, or `mdcp check --require-lint`):

```bash
npm install -D markdownlint-cli2 @vvago/vale @bwilliamson/mdcp-presets
```

### Quick start

1. Copy a starter config from the [mdcp repo](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json) into your docs directory as `mdcp.config.json`.

2. Lay out shards under guide directories (each with `index.md`, `sections.txt`, and chapter files). See [examples/sample-guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides).

3. Run:

```bash
mdcp compile --config mdcp.config.json
mdcp check --config mdcp.config.json
```

Global options (apply to every command):

| Option                | Default            | Purpose                                                      |
| --------------------- | ------------------ | ------------------------------------------------------------ |
| `-c, --config <path>` | `mdcp.config.json` | Path to config file                                          |
| `--cwd <path>`        | current directory  | Docs root (guide dirs and output paths are relative to this) |

## Project layout

| Piece                                            | Role                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------- |
| Guide directory (`overview/`, `admin-guide/`, …) | One logical guide                                                           |
| `index.md`                                       | Human table of contents — links to shard files                              |
| `sections.txt`                                   | Machine compile order — **guide-relative** filenames (from `mdcp sections`) |
| `chapter-*.md` (typical)                         | One topic or chapter per file — naming is conventional, not required        |
| `about-this-guide.md`                            | Optional preamble shard                                                     |
| `guides.md`                                      | Compiled monolith (generated — do not edit by hand)                         |
| `refs.json`                                      | Section link lookup table (written by `mdcp check` or `mdcp refs gen`)      |

Shards use `#` headings so each file reads well on its own. During compile, mdcp demotes headings under the guide title in the monolith.

`sections.txt` lists shard paths **relative to the guide directory** (for example `introduction.md`). Never commit absolute machine paths.

Guides can also set `compile.outputFile` to publish a standalone document (for example an npm `README.md`) excluded from the monolith.

## Config essentials

Minimal `mdcp.config.json`:

```json
{
  "outputFile": "guides.md",
  "compileOrder": ["overview", "admin-guide"],
  "guides": [{ "name": "overview" }, { "name": "admin-guide" }],
  "refs": { "registryFile": "refs.json" }
}
```

| Field               | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `compileOrder`      | Order of guide directories in the compiled monolith    |
| `guides`            | Per-guide options (hooks, manifests, separate outputs) |
| `outputFile`        | Compiled monolith path                                 |
| `refs.registryFile` | Cross-link lookup table path                           |
| `lint`              | markdownlint configs, xref checks, link checking       |
| `vale`              | Prose lint paths and `.vale.ini` location              |
| `source`            | Monolith path — required only for `mdcp shard`         |

Per-guide `compile.outputFile` writes a publish target (relative to `--cwd`) and excludes that guide from the monolith. Use `compile.includeBanner: false` for npm README outputs.

### Schema-only fields

These keys validate in `mdcp.config.json` but are **not wired** in the current CLI implementation:

| Field                              | Notes                                                       |
| ---------------------------------- | ----------------------------------------------------------- |
| `guides[].splitLevel`              | Reserved for shard split; compile uses directory shards     |
| `guides[].compile.preambleSection` | Default exists; preamble handling is convention-based today |
| `guides[].source.type: directory`  | Alternative source model — not used by compile/check        |
| `refs.slugAlgorithm`               | Only `github` is supported; field is informational          |
| `vale.strictMinAlertLevel`         | Vale CLI flags are not driven from config yet               |
| `export.llm.skipIndexFiles`        | LLM export always skips `index.md` today                    |

Full schema and examples: [mdcp.config.json in sample-guides](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json).

## Commands reference

### Daily workflow

```bash
# Regenerate the monolith from shards
mdcp compile

# Full validation gate (orphans → compile → refs → xrefs; optional linters)
mdcp check

# Regenerate sections.txt after changing a guide's index.md
mdcp sections
```

### Command summary

| Command                    | When you need it                                                     |
| -------------------------- | -------------------------------------------------------------------- |
| `mdcp compile`             | Regenerate the monolith from shards                                  |
| `mdcp check`               | Full gate: orphans → compile → refs → xrefs; optional peer linters   |
| `mdcp shard`               | Split a monolith into shards (requires `config.source`)              |
| `mdcp sections`            | Regenerate `sections.txt` after changing a guide's `index.md`        |
| `mdcp refs list`           | List heading slugs from `refs.json` as JSON                          |
| `mdcp refs lookup <query>` | Search compiled section titles while writing cross-links             |
| `mdcp export --llm`        | Token-stripped compiled output for LLM context                       |
| `mdcp lint`                | markdownlint-cli2 on shards and compiled output (peer, if installed) |
| `mdcp prose`               | Vale prose lint (peer, if installed)                                 |
| `mdcp links`               | markdown-link-check on compiled output (peer, if installed)          |
| `mdcp fix`                 | Prettier + markdownlint `--fix` (install peers in host repo first)   |

### Refs subcommands

| Command                    | Purpose                                                                    |
| -------------------------- | -------------------------------------------------------------------------- |
| `mdcp refs gen`            | Generate `refs.json` from compiled output                                  |
| `mdcp refs check`          | Verify `refs.json` matches compiled output                                 |
| `mdcp refs list`           | List heading slugs from `refs.json` (run `mdcp check` or `refs gen` first) |
| `mdcp refs lookup <query>` | Fuzzy-search titles from freshly compiled output                           |

### LLM and agent context

```bash
# Token-stripped compiled output for coding agents
mdcp export --llm --stdout

# Find section links while authoring
mdcp refs lookup "authentication" --format json
```

## Cross-links and refs

When writing `[link text](#anchor)` in a shard, the anchor must match the compiled heading slug. Look it up instead of guessing:

```bash
mdcp refs lookup "getting started" --format json
mdcp refs list
```

The part after `#` must match how the compiled doc names that heading — which changes when shards are merged and headings shift level.

Section links are derived from compiled headings using the same rules GitHub uses when rendering. No hand-maintained `` required.

## Consumer migration

Add `source` to your config pointing at your existing monolith, then:

```bash
mdcp shard
mdcp sections
mdcp compile
mdcp check
```

### Steps for a new consumer repo

1. Add `mdcp.config.json` to your docs shard directory
2. Replace local compile scripts with `npx @bwilliamson/mdcp-cli compile`
3. Replace validate scripts with `npx @bwilliamson/mdcp-cli check --require-lint`
4. Use `mdcp refs lookup` for cross-link slugs (no ``)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

Full maintainer migration map: [Legacy migration](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/legacy-migration.md).

## Agent integration

Add npm scripts in your consumer repo:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --cwd docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --cwd docs --require-lint",
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --cwd docs",
    "docs:refs": "mdcp refs lookup"
  }
}
```

```bash
# Compact context for feature work
mdcp export --llm --stdout --config docs/mdcp.config.json

# Find the right section link while writing
mdcp refs lookup "authentication" --format json

# Full structural gate
mdcp check --require-lint
```

### Related packages

| Package                                                                                | Use                                                         |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`@bwilliamson/mdcp-core`](https://www.npmjs.com/package/@bwilliamson/mdcp-core)       | Programmatic compile, refs, and validation API              |
| [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) | Starter markdownlint configs for shards and compiled output |

### Further reading

- [Project README](https://github.com/betsalel-williamson/mdcp#readme) — concepts and design rationale
- [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md) — full maintainer docs
- [Sample guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides)

### License

MIT

## Optional linters

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
