# The Toolchain

MDCP has **three separate surfaces**. Do not treat the Agent Skill and the npm packages as the same install.

- **Agent Skill** — host-loaded instructions (`/mdcp`, subagents) for how agents maintain shards. Install with `npx skills add … --skill mdcp`. Docs: this README.
- **CLI** — shell tool: `mdcp compile`, `mdcp check`, refs, optional lint. Docs: [`@bwilliamson/mdcp-cli`](./packages/mdcp-cli/README.md).
- **Core** — programmatic API used by the CLI and custom tooling. Docs: [`@bwilliamson/mdcp-core`](./packages/mdcp-core/README.md).

The skill tells agents _when_ and _how_ to use documentation; the CLI/core **execute** compile and validation. Agents still need `@bwilliamson/mdcp-cli` (or equivalent scripts) in the repo for those commands to run.
