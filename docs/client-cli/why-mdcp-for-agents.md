# Why mdcp for coding agents

**mdcp** splits, compiles, validates, and exports sharded Markdown documentation. You edit small shard files; mdcp weaves them into compiled output with correct heading levels, working cross-links, and structure checks.

## Why use it with coding agents?

Agents edit individual `.md` shards instead of a monolithic README. mdcp compiles shards into a single guide, validates cross-references, and exports token-stripped context (`mdcp export --llm`) for the next agent turn. No custom bash or Python compile scripts to maintain.

**Get started:** copy the [bootstrap prompt](../../examples/prompts/getting-started-with-mdcp.prompt.md) from `examples/prompts/`. Fill in the **Replace before sending** code block at the top. Workflow index: [LLM collaboration](./llm-collaboration.md).

For depth on capabilities and design, read the [feature catalog](../features/feature-catalog.md).
