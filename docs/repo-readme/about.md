# Why use MDCP?

- **Docs-as-code discipline for Agents:** Forces agents to plan in Markdown shards rather than hallucinating in the chat window.
- **Smaller context when you read one shard:** Shards keep per-turn context small versus loading a full compiled guide — when agents open a single shard instead of the monolith.
- **Validation gate:** `mdcp check` runs in CI to guarantee that references and links between shards are valid.
- **Portable:** Works natively in Cursor, GitHub Copilot, Claude Code, and other agent hosts that support the Agent Skills standard.
