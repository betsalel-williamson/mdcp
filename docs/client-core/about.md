# About @bwilliamson/mdcp-core

The **programmatic core library** for the [MarkDown Context Protocol (MDCP)](https://github.com/betsalel-williamson/mdcp).

Use this package when you need compile, validation, and refs APIs in scripts, CI, editors, or other tools **without** shelling out to the CLI.

## Not the CLI or the Agent Skill

- **This library** — TypeScript/Node API via `@bwilliamson/mdcp-core` on npm
- **CLI** — command-line wrapper around this library: [`@bwilliamson/mdcp-cli`](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)
- **Agent Skill** — host instructions for docs-as-code agents: [root README](../../README.md) / `npx skills add … --skill mdcp`

`@bwilliamson/mdcp-cli` depends on this package. Install `@bwilliamson/mdcp-core` directly only when you need the programmatic API. Agent Skill install does **not** replace this library.
