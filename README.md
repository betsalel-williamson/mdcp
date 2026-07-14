# MDCP — documentation system Agent Skill

## What this tool is

[![skills.sh](https://skills.sh/b/betsalel-williamson/mdcp)](https://skills.sh/betsalel-williamson/mdcp)

**mdcp** is a **documentation system** delivered as an [Agent Skill](https://agentskills.io) plus a small compile/check toolchain. It is for people who know good docs compound — and that unvalidated monolith READMEs get expensive as product ideas keep arriving.

Instead of dumping every mind map, architecture note, and spec into one file that overwhelms both humans and LLM context windows, MDCP keeps that intent in small, validated Markdown **shards** (for example `docs/features/my-feature.md`). Agents learn to read **one shard at a time**, update docs before coding, and run checks in CI — so documentation stays findable and trustworthy as the system grows. Discover and install via [skills.sh](https://skills.sh/betsalel-williamson/mdcp).

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
```

## Why use MDCP?

- **Built for documentation-system thinkers:** Puts durable intent (specs, design notes, glossaries) in the repo where it compounds — not only in chat history or slide decks.
- **Lower maintenance as ideas keep coming:** One topic per shard means new features extend the docs tree instead of bloating a monolith you no longer trust.
- **Docs-as-code for agents:** Coding agents update shards before implementing, so “what we meant” stays reviewable in git alongside the change.
- **Smaller, safer context loads:** People and LLMs read the section that matches the task — not the whole guide every turn.
- **Validation gate:** `mdcp check` keeps cross-links and refs trustworthy in CI when the docs system grows.
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
