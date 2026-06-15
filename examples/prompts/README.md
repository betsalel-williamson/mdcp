# Agent prompt templates

Copy-paste prompts for coding agents working with mdcp. Fill in the **Replace before sending** code block at the top of each file, then send the rest unchanged. Work-item lookup: [work-item-tracking.md](./work-item-tracking.md).

| Prompt                                                                     | Use when                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [docs-as-code-with-mdcp.prompt.md](./docs-as-code-with-mdcp.prompt.md)     | Bootstrapping a new sharded docs pipeline in a consumer repo    |
| [work-item-tracking.md](./work-item-tracking.md)                           | Generic lookup pattern; agents discover tools via repo dev docs |
| [doc-only-task.prompt.md](./doc-only-task.prompt.md)                       | Documentation-only work (tutorials, guides, shard revisions)    |
| [design-architecture-task.prompt.md](./design-architecture-task.prompt.md) | RFCs, ADRs, and data models before implementation               |
| [feature-level-task.prompt.md](./feature-level-task.prompt.md)             | Server-side or full-stack feature work with docs-first and TDD  |
| [ux-task.prompt.md](./ux-task.prompt.md)                                   | UI flows, accessibility, and client-guide updates               |

Published copies and inline versions also appear in the [LLM collaboration](https://github.com/betsalel-williamson/mdcp/blob/main/docs/client-cli/llm-collaboration.md) consumer guide.
