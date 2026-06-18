# Why mdcp for coding agents

**MDCP** ([MarkDown Context Protocol](../glossary/mdcp.md)) splits, compiles, validates, and exports sharded Markdown documentation. Shards are the source of truth; compiled output is generated.

## The pain

LLM pair-coding on a repo breaks down when documentation is a single monolith, unvalidated, and mixed up with implementation:

| Pain                       | What goes wrong                                            | mdcp command                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Monolithic guides**      | Merge conflicts, missing sections, stale table of contents | `mdcp compile` stitches shards; `mdcp check` catches orphans                                                                                     |
| **Broken cross-links**     | Agents guess `#anchor` slugs; links rot after edits        | `mdcp refs lookup` reads slugs from **compiled** output                                                                                          |
| **Context overload**       | Entire README in every agent turn                          | `mdcp export --llm` strips tokens for scoped context                                                                                             |
| **Docs drift**             | Shards and published output diverge silently               | `mdcp check` runs compile → refs → xrefs before merge                                                                                            |
| **Custom compile scripts** | Bash/Python glue nobody owns                               | `compile`, `check`, and `@bwilliamson/mdcp-presets` replace one-offs                                                                             |
| **Plan mixed with code**   | Agents re-implement from stale prose or skip user value    | Three-tier shards: `docs/features/` (plumbing), `docs/client/` (persona value), `docs/developer/` (repo workflow) — implementation stays in code |

Documentation should carry **context and the high-level plan**; code carries **implementation detail**. mdcp enforces that split with a validation gate agents and CI can run the same way.

## Typical agent loop

Edit shards → `mdcp refs lookup "topic"` while writing links → `mdcp compile` → `mdcp check` → `mdcp export --llm` when the next turn needs doc context.

## Get started

First-time setup in a consumer repo: copy [getting-started-with-mdcp.prompt.md](../../spec/extensions/prompts-mdcp-defaults/0.4.0.0/getting-started-with-mdcp.prompt.md) (or load from `.caches/mdcp/prompts/` after fetch), fill in `FEATURE=` and `PERSONA=`, and send. Task-type prompts and workflow index: [LLM collaboration](./llm-collaboration.md).

For command and capability depth, read the [feature catalog](../features/feature-catalog.md).
