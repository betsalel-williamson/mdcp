# Install and quick start

**mdcp** splits, compiles, validates, and exports sharded Markdown documentation. You edit small shard files; mdcp weaves them into one compiled guide (`guides.md`) with correct heading levels, working cross-links, and structure checks.

This package installs the `mdcp` command for use in your repo or CI.

## Requirements

- Node.js **>= 22.12.0**

## Install

```bash
# Dev dependency (recommended)
npm install -D @bwilliamson/mdcp-cli

# Or run without installing
npx @bwilliamson/mdcp-cli check --config mdcp.config.json

# Global install
npm install -g @bwilliamson/mdcp-cli
```

## Stability

**Pre-1.0:** There is **no API stability guarantee** until **1.0.0**. CLI commands, flags, `mdcp.config.json` schema, and compile output may change in any `0.x.y` release. Pin a specific version and read package changelogs before upgrading.

Optional lint tooling (install in your repo when you want `mdcp lint`, `mdcp prose`, or `mdcp check --require-lint`):

```bash
npm install -D markdownlint-cli2 @vvago/vale @bwilliamson/mdcp-presets
```

## Quick start

1. Copy a starter config from the [mdcp repo](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json) into your docs directory as `mdcp.config.json`.

2. Lay out shards under guide directories (each with `index.md`, `sections.txt`, and chapter files). See [examples/sample-guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides).

3. Run:

```bash
mdcp compile --config mdcp.config.json
mdcp check --config mdcp.config.json
```

Collaborating with an LLM? See [LLM collaboration](./llm-collaboration.md) for bootstrap prompts and toolchain integration (Cursor, Composer, Gemini CLI).

Global options (apply to every command):

| Option                | Default            | Purpose                                                      |
| --------------------- | ------------------ | ------------------------------------------------------------ |
| `-c, --config <path>` | `mdcp.config.json` | Path to config file                                          |
| `--cwd <path>`        | current directory  | Docs root (guide dirs and output paths are relative to this) |
