# MDCP — MarkDown Context Protocol (Agent Skill)

## What this tool is

**mdcp** is an open standard and [Agent Skill](https://agentskills.io) for **technical documentation context**.

Instead of massive, unvalidated monolithic READMEs that overwhelm LLM context windows, MDCP organizes knowledge into small, validated Markdown **shards** (e.g. `docs/features/my-feature.md`). The MDCP Agent Skill trains your coding agents (in Cursor, Copilot, or Claude) to read these shards one by one, update them before coding, and validate them in CI.

## Get started

MDCP is delivered as a zero-dependency **Agent Skill**. Once installed in your repository, it acts as a system-level prompt that teaches your AI tools how to interact with your project's documentation.

### Quick Start

Install the core MDCP Agent Skill into your repository:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

_(This copies the `.agents/skills/mdcp/` folder into your repository. Commit it to git to ensure all team members and agents share the same instructions)._

Once installed, your agents will proactively use MDCP commands to look up context, compile documentation, and validate references before writing code.

### Complementary Skills

You can add complementary skills for specific documentation architectures:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-oss-library
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-product-docs-site
npx skills add betsalel-williamson/mdcp --skill mdcp-format-marp
```

## Why use MDCP?

- **Docs-as-code discipline for Agents:** Forces agents to plan in Markdown shards rather than hallucinating in the chat window.
- **Smaller context when you read one shard:** Shards keep per-turn context small versus loading a full compiled guide — when agents open a single shard instead of the monolith.
- **Validation gate:** `mdcp check` runs in CI to guarantee that references and links between shards are valid.
- **Portable:** Works natively in Cursor, GitHub Copilot, Claude Code, and other agent hosts that support the Agent Skills standard.

## The Toolchain

The MDCP workflow is enforced by the skill, but executed by the underlying CLI and Core libraries:

- [`@bwilliamson/mdcp-cli`](./packages/mdcp-cli/README.md) - The command-line interface for compiling and checking shards.
- [`@bwilliamson/mdcp-core`](./packages/mdcp-core/README.md) - The programmatic API for integrating MDCP into custom tooling.

## Learn More

- [Vision and roadmap](docs/features/protocol/00-vision-and-roadmap.md)
- [Agent Skill delivery](docs/features/agent-skill.md)
- [CLI consumer guide](docs/client-cli/index.md)

## This repository

Contributors and maintainers working on the **mdcp monorepo** — not consumers adopting mdcp in another repo.

```bash
pnpm install && pnpm build
pnpm docs:check
```

Full guide: [DEVELOPERS.md](DEVELOPERS.md). Sharded docs layout: [Docs dogfooding](docs/developer/docs-dogfooding.md). Publish landing style: [Personas and priority tiers](docs/features/personas-and-priority-tiers.md#publish-landing-style).

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

### Status

**Open alpha (0.4.x).** Pin `@bwilliamson/mdcp-cli@0.4.1`. There is **no API stability guarantee** until npm 1.0.

**Get involved:** [GitHub Issues](https://github.com/betsalel-williamson/mdcp/issues) for feedback and bugs; [adoption stories](https://github.com/betsalel-williamson/mdcp/issues/new?template=adoption-story.yml) for real-world use.

### Acknowledgments

- [Denali Lumma (@dlumma)](https://github.com/dlumma) — early review and feedback

### License

MIT
