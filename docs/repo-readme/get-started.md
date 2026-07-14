# Get started

Two equal paths — use whichever fits your workflow.

## Path A — paste into your agent

1. Open [getting-started.md](../../.agents/skills/mdcp/agents/getting-started.md).
2. Fill in `FEATURE=` and `PERSONA=` at the top.
3. Copy the **entire file** into your coding-agent chat (Cursor, Claude, Copilot, etc.) and send.

The agent inspects your repo and walks through config, shard layout, and first `mdcp check`.

Optional — fetch prompts into your docs root first:

```bash
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-profile alpha --fetch-ref v0.4.1 --docs-root docs
```

## Path B — CLI init (0.5 preview)

```bash
npx @bwilliamson/mdcp-cli init --docs-root docs
```

Choose **defaults** (standard scaffold) or **augment** (map MDCP onto existing docs). Then compile and check:

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
mdcp check --config docs/mdcp.config.json --docs-root docs
```

Details: [Install and quick start](../client-cli/install-and-quick-start.md).

## Pick your path

| Archetype                                     | Suits Path / start here                          |
| --------------------------------------------- | ------------------------------------------------ |
| **Builder** — integrate mdcp into a repo      | A or B                                           |
| **Learner** — try mdcp with agent help first  | A                                                |
| **Author** — write shards; delegate CLI setup | A                                                |
| **Champion** — evaluate or sponsor adoption   | Vision and roadmap → Benefit claims and evidence |

**Champion start:** [Vision and roadmap](../features/protocol/00-vision-and-roadmap.md) → [Benefit claims and evidence](../features/protocol/benefit-claims-and-evidence.md).

More depth per archetype: [Learn more](./learn-more.md).
