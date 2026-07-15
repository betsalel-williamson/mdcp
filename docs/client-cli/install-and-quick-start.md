# Install and quick start

This package installs the `mdcp` command for use in your repo or CI. It works in **any** codebase — language, framework, and repo layout do not matter; mdcp only manages your documentation shards and compile pipeline.

**Fastest path:** install the Agent Skill, activate `/mdcp`, name the `getting-started` subagent ([getting-started.md](../../skills/mdcp/agents/getting-started.md)). Answer the agent’s intake questions for `FEATURE` and `PERSONA`.

## Requirements

- Node.js **>= 24.0.0**

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

**Open alpha (0.4.0).** MDCP is moving fast — this release is a working foundation for early adopters. Tooling and the draft protocol profile may change in 0.5+. Pin a specific version:

```bash
npm install -D @bwilliamson/mdcp-cli@0.4.1
```

**Pre-1.0:** There is **no API stability guarantee** until **1.0.0**. CLI commands, flags, `mdcp.config.json` schema, and compile output may change in any `0.x.y` release. Read package changelogs before upgrading.

### Get involved

Visit [github.com/betsalel-williamson/mdcp](https://github.com/betsalel-williamson/mdcp), **star** the repo to follow progress, and **open or comment on [GitHub Issues](https://github.com/betsalel-williamson/mdcp/issues)** with feedback, adoption stories, or bugs.

Optional lint tooling (install in your repo when you want `mdcp lint`, `mdcp prose`, or `mdcp check --require-lint`):

```bash
npm install -D markdownlint-cli2 @bwilliamson/mdcp-presets
```

For prose lint (`mdcp prose`, `mdcp check --require-vale`), install [Vale](https://vale.sh/docs/vale-cli/installation/) separately so `vale` is on your `PATH`.

## Quick start

**Agent Skill (optional day zero)** — prefer installing the Agent Skill (`npx skills add betsalel-williamson/mdcp --skill mdcp`). Subagents then live under `.agents/skills/mdcp/agents/` — upstream copies: [skills/mdcp/agents/](../../skills/mdcp/agents/). Invoke with `/mdcp` then a subagent id — see [LLM collaboration](./llm-collaboration.md).

1. Copy a starter config from [examples/sample-guides/mdcp.config.json](../../examples/sample-guides/mdcp.config.json) into your docs directory as `mdcp.config.json`.

2. Lay out shards under guide directories (each with `index.md` and chapter files). See [examples/sample-guides](../../examples/sample-guides/).

3. Run:

```bash
# When your shell is in the docs directory
mdcp compile --config mdcp.config.json
mdcp check --config mdcp.config.json
```

From the **repository root** (typical npm scripts), pass both `--config` and `--docs-root`:

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
mdcp check --config docs/mdcp.config.json --docs-root docs
```

`--config` is resolved from where you run the command; `--docs-root` sets the docs root. Details: [Config essentials](./config-essentials.md#--config-vs---docs-root).

Global options (apply to every command):

| Option                | Default            | Purpose                                                                          |
| --------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `-c, --config <path>` | `mdcp.config.json` | Config file path, resolved from the **invocation directory** (not `--docs-root`) |
| `--docs-root <path>`  | current directory  | Docs root — one subdirectory per guide shard tree                                |
