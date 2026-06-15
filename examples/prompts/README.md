# Agent prompt templates

Copy-paste prompts for agents working with mdcp. Fill in the **Replace before sending** code block at the top of each file, then send the rest unchanged. Task-type prompts include `WORK_ITEM` and `WORK_ITEM_LOOKUP` — point `WORK_ITEM_LOOKUP` at your repo's developer docs for tracker integration.

Each prompt assumes the agent can **plan from repo context** — inspect developer docs, scripts, and configuration rather than rely on vendor-specific commands baked into the template.

## Workflow best practices

Task-type prompts (`WORK_ITEM` + `WORK_ITEM_LOOKUP`) share these conventions:

- **Branch first** — create a feature branch from updated `main` before shards, tests, or code
- **One issue per branch** — stay focused on a single feature, design, or doc scope; do not mix unrelated work in one PR
- **Current behavior in docs** — shards describe the product as it works now; removed or breaking behavior belongs in the **changeset**, not feature or client guides

Point `WORK_ITEM_LOOKUP` at your repo's agent work-item tracking shard (this repo: [Agent work-item tracking](../../docs/developer/agent-work-item-tracking.md)).

| Prompt                                                                       | Use when                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [getting-started-with-mdcp.prompt.md](./getting-started-with-mdcp.prompt.md) | Bootstrapping a sharded docs pipeline in a consumer repo     |
| [doc-only-task.prompt.md](./doc-only-task.prompt.md)                         | Documentation-only work (tutorials, guides, shard revisions) |
| [design-architecture-task.prompt.md](./design-architecture-task.prompt.md)   | RFCs, ADRs, and data models before implementation            |
| [feature-level-task.prompt.md](./feature-level-task.prompt.md)               | Feature work — docs-first, then TDD; scope from tracker      |
| [ux-task.prompt.md](./ux-task.prompt.md)                                     | UI flows, accessibility, and client-guide updates            |

Consumer guide index (workflow, layout, review): [LLM collaboration](../../docs/client-cli/llm-collaboration.md).
