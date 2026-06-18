# Agent task prompts (protocol spec)

Versioned **meta-level** copy-paste prompts for agents working with mdcp sharded documentation. They ship with protocol `0.4.0.0` and are listed in [llms-index artifacts](../llms-index/) under **Task prompts**.

## Consumer repos

Fetch the index and prompt bundle together:

```bash
mdcp export --llms-index --fetch --fetch-profile dev --docs-root docs
```

Prompts are written to `.caches/mdcp/prompts/` under the docs root (`manifest.json` records protocol version and upstream ref). Agents load prompts from that cache; the fetched `mdcp.v*.llms.txt` references the same paths.

Host-specific agent systems **MAY** substitute their own prompts. Written shards **SHOULD** still follow the layout, glossary, and validation conventions in the fetched llms-index.

## Prompt files

| File                                                                         | Use when                              |
| ---------------------------------------------------------------------------- | ------------------------------------- |
| [getting-started-with-mdcp.prompt.md](./getting-started-with-mdcp.prompt.md) | Bootstrapping a sharded docs pipeline |
| [feature-level-task.prompt.md](./feature-level-task.prompt.md)               | Feature work — docs-first, then TDD   |
| [doc-only-task.prompt.md](./doc-only-task.prompt.md)                         | Documentation-only revisions          |
| [design-architecture-task.prompt.md](./design-architecture-task.prompt.md)   | RFCs, ADRs, data models               |
| [ux-task.prompt.md](./ux-task.prompt.md)                                     | UI flows and client guides            |
| [review-task.prompt.md](./review-task.prompt.md)                             | Architecture and security review      |

Normative profile: [docs/features/protocol/agent-task-prompts.md](../../docs/features/protocol/agent-task-prompts.md).

## Maintainer sync

When editing prompts here, run `pnpm spec:sync-llms-index` if the llms-index task table changed, and `pnpm docs:compile:repo` so dogfooded docs stay aligned.
