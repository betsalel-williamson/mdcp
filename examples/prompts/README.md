# Agent prompt templates

Copy-paste prompts for agents working with mdcp. Fill in the **Replace before sending** code block at the top of each file, then send the rest unchanged. Work-item lookup: [work-item-tracking.md](./work-item-tracking.md).

Each prompt assumes the agent can **plan from repo context** — inspect developer docs, scripts, and configuration rather than rely on vendor-specific commands baked into the template.

| Prompt                                                                     | Use when                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [docs-as-code-with-mdcp.prompt.md](./docs-as-code-with-mdcp.prompt.md)     | Bootstrapping a sharded docs pipeline in a consumer repo     |
| [work-item-tracking.md](./work-item-tracking.md)                           | How to fill `WORK_ITEM` and `WORK_ITEM_LOOKUP`               |
| [doc-only-task.prompt.md](./doc-only-task.prompt.md)                       | Documentation-only work (tutorials, guides, shard revisions) |
| [design-architecture-task.prompt.md](./design-architecture-task.prompt.md) | RFCs, ADRs, and data models before implementation            |
| [feature-level-task.prompt.md](./feature-level-task.prompt.md)             | Feature work with docs-first scope and repo test conventions |
| [ux-task.prompt.md](./ux-task.prompt.md)                                   | UI flows, accessibility, and client-guide updates            |
| [phase-spec-flow.prompt.md](./phase-spec-flow.prompt.md)                   | User story, design, task breakdown, and ADR phases           |

Consumer guide index (workflow, layout, review): [LLM collaboration](https://github.com/betsalel-williamson/mdcp/blob/main/docs/client-cli/llm-collaboration.md).
