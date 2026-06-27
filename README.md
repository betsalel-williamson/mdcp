# MDCP — MarkDown Context Protocol

## What this tool is

**mdcp** is an open protocol for **technical documentation context** — sharded intent and design in Markdown, validated compile output for agents, CI, and human readers. Software repositories are the most common adoption path; the same shard model applies to factory procedures, equipment manuals, training curricula, and other durable technical knowledge.

New to MDCP? Read [Vision and roadmap](docs/features/protocol/00-vision-and-roadmap.md) for problem, principles, and phased delivery.

## What's in it for you

Pick the goal that matches you — not a job title:

| Archetype    | What you get                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| **Builder**  | One validation gate for humans, agents, and CI; edit small files instead of one giant doc.               |
| **Learner**  | Paste a prompt into your agent; it sets up the pipeline while you learn the commands.                    |
| **Author**   | One topic per file; load matching sections per the [usage model](docs/features/protocol/usage-model.md). |
| **Champion** | A reviewable doc contract for your org (OpenAPI-style intent, not performance claims).                   |

Messaging rules: [Benefit claims and evidence](docs/features/protocol/benefit-claims-and-evidence.md).

## Get started

Two equal paths — use whichever fits your workflow.

### Path A — paste into your agent

1. Open [getting-started-with-mdcp.prompt.md](spec/extensions/prompts-mdcp-defaults/0.4.0.0/getting-started-with-mdcp.prompt.md).
2. Fill in `FEATURE=` and `PERSONA=` at the top.
3. Copy the **entire file** into your coding-agent chat (Cursor, Claude, Copilot, etc.) and send.

The agent inspects your repo and walks through config, shard layout, and first `mdcp check`.

Optional — fetch prompts into your docs root first:

```bash
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-profile alpha --fetch-ref v0.4.1 --docs-root docs
```

### Path B — CLI init (0.5 preview)

```bash
npx @bwilliamson/mdcp-cli init --docs-root docs
```

Choose **defaults** (standard scaffold) or **augment** (map MDCP onto existing docs). Then compile and check:

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
mdcp check --config docs/mdcp.config.json --docs-root docs
```

Details: [Install and quick start](docs/client-cli/install-and-quick-start.md).

### Pick your path

| Archetype                                     | Suits Path / start here                          |
| --------------------------------------------- | ------------------------------------------------ |
| **Builder** — integrate mdcp into a repo      | A or B                                           |
| **Learner** — try mdcp with agent help first  | A                                                |
| **Author** — write shards; delegate CLI setup | A                                                |
| **Champion** — evaluate or sponsor adoption   | Vision and roadmap → Benefit claims and evidence |

**Champion start:** [Vision and roadmap](docs/features/protocol/00-vision-and-roadmap.md) → [Benefit claims and evidence](docs/features/protocol/benefit-claims-and-evidence.md).

More depth per archetype: [Learn more](#want-to-know-more).

## Want to know more

Depth lives in linked shards — not on this page.

### Builder

**Goal:** wire tooling and read the spec.

- [CLI consumers guide](docs/client-cli/index.md)
- [Install and quick start](docs/client-cli/install-and-quick-start.md)
- [Spec and extensions](spec/extensions/README.md)

### Learner

**Goal:** adopt with agent assistance.

- [Getting started prompt](spec/extensions/prompts-mdcp-defaults/0.4.0.0/getting-started-with-mdcp.prompt.md)
- [LLM collaboration](docs/client-cli/llm-collaboration.md)

### Author

**Goal:** document a domain without owning the toolchain.

- [Vision and roadmap](docs/features/protocol/00-vision-and-roadmap.md)
- [Scope and positioning](docs/features/protocol/01-scope-and-positioning.md)
- [Alternatives and adoption](docs/features/protocol/02-alternatives-and-adoption.md)

### Champion

**Goal:** evaluate or sponsor org adoption.

- [Vision and roadmap](docs/features/protocol/00-vision-and-roadmap.md)
- [Benefit claims and evidence](docs/features/protocol/benefit-claims-and-evidence.md)
- [Why MDCP](docs/client-cli/why-mdcp-overview.md)
- [Scope and positioning](docs/features/protocol/01-scope-and-positioning.md)
- [MDCP 1.0 spec (draft)](docs/features/protocol/mdcp-1.0-spec.md)

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
