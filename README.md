# MDCP — MarkDown Context Protocol (Agent Skill)

## What this tool is

[![skills.sh](https://skills.sh/b/betsalel-williamson/mdcp)](https://skills.sh/betsalel-williamson/mdcp)

**mdcp** is an [Agent Skill](https://agentskills.io) and toolchain for **technical documentation context**. Discover and install it via [skills.sh](https://skills.sh/betsalel-williamson/mdcp).

It is not a magic bullet — it is a helpful way to head off the long-term cost of poor docs. Instead of massive, unvalidated monolithic READMEs that overwhelm LLM context windows, MDCP helps you distill mind maps, architecture notes, specs, and product ideas into small, validated Markdown **shards** (e.g. `docs/features/my-feature.md`). The skill trains coding agents (in Cursor, Copilot, or Claude) to read those shards one by one, update them before coding, and validate them in CI — so people and AIs can trace value, learn the tools, and keep the system understandable as it grows. Works for a team of one or a full product, engineering, and marketing org.

## Get started

MDCP is delivered as a zero-dependency **Agent Skill**. Once installed in your repository, it acts as a system-level prompt that teaches your AI tools how to interact with your project's documentation. Install with the [`skills` CLI](https://www.skills.sh/docs/cli) (same path as [skills.sh](https://skills.sh)).

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

- **Puts intent in the right place:** Distills mind maps, specs, and design notes into durable shards that stay with the repo over the long term.
- **Docs-as-code discipline for agents:** Helps agents plan in Markdown shards rather than inventing context in the chat window.
- **Small chunks, clearer roots:** Shards keep ideas digestible for people and keep LLMs on track — one shard at a time instead of a monolith dump.
- **Validation gate:** `mdcp check` runs in CI so references and links between shards stay trustworthy.
- **Scales with the org:** Useful for a solo builder or a full product, engineering, and marketing team.
- **Portable skill:** Works in Cursor, GitHub Copilot, Claude Code, and other hosts that support [Agent Skills](https://agentskills.io).

## The Toolchain

The MDCP workflow is enforced by the skill, but executed by the underlying CLI and Core libraries:

- [`@bwilliamson/mdcp-cli`](./packages/mdcp-cli/README.md) - The command-line interface for compiling and checking shards.
- [`@bwilliamson/mdcp-core`](./packages/mdcp-core/README.md) - The programmatic API for integrating MDCP into custom tooling.

## Learn More

- [skills.sh — MDCP skills](https://skills.sh/betsalel-williamson/mdcp)
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
