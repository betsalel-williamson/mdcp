# Why mdcp for coding agents

**MDCP** ([MarkDown Context Protocol](../glossary/mdcp.md)) splits, compiles, validates, and exports sharded Markdown documentation. Shards are the source of truth; compiled output is generated.

## The pain

LLM pair-coding on a repo breaks down when documentation is a single monolith, unvalidated, and mixed up with implementation:

| Pain                       | What goes wrong                 | Command                                                |
| -------------------------- | ------------------------------- | ------------------------------------------------------ |
| **Monolithic guides**      | Merge conflicts, stale TOC      | `mdcp compile`; `mdcp check` catches orphans           |
| **Broken cross-links**     | Agents guess `#anchor` slugs    | `mdcp check` (optional `mdcp refs list` for slugs)     |
| **Context overload**       | Monolith pasted each agent turn | Host search, then read one shard                       |
| **Docs drift**             | Shards and output diverge       | `mdcp check` before merge                              |
| **Custom compile scripts** | Bash/Python glue nobody owns    | `compile`, `check`, `@bwilliamson/mdcp-presets`        |
| **Plan mixed with code**   | Stale prose drives wrong code   | Shards under `docs/features/`, `client/`, `developer/` |

Documentation should carry **context and the high-level plan**; code carries **implementation detail**. mdcp enforces that split with a validation gate agents and CI can run the same way. For granular reads, follow the [usage model](../features/protocol/usage-model.md).

## Typical agent loop

Discover shards with host search (`rg`, IDE search) → edit shards → `mdcp compile` → `mdcp check` (optional `mdcp refs list` to inspect slugs) → `mdcp export --llm` when the next turn needs doc context.

## Get started

First-time setup in a consumer repo: activate `/mdcp`, name the `getting-started` subagent ([getting-started.md](../../skills/mdcp/agents/getting-started.md)). The agent asks for `FEATURE` and `PERSONA` before editing. Subagent catalog and workflow: [LLM collaboration](./llm-collaboration.md).

For command and capability depth, read the [feature catalog](../features/feature-catalog.md).
