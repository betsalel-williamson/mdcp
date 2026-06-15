# Why mdcp for coding agents

**mdcp** splits, compiles, validates, and exports sharded Markdown documentation. You edit small shard files; mdcp weaves them into compiled output with correct heading levels, working cross-links, and structure checks.

## Why use it with coding agents?

Agents edit individual `.md` shards instead of a monolithic README. mdcp compiles shards into a single guide, validates cross-references, and exports token-stripped context (`mdcp export --llm`) for the next agent turn. No custom bash or Python compile scripts to maintain.

**Get started:** copy the [bootstrap prompt](#bootstrap-prompt-copy-paste) below into Cursor Agent, Composer, Gemini CLI, or any shell-capable agent. Fill in `{{FEATURE}}` and `{{PERSONA}}`.

For depth on capabilities and design, read the [feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md).
