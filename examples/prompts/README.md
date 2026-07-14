# Agent prompt templates (examples)

**Canonical source:** [.agents/skills/mdcp/agents/](../../.agents/skills/mdcp/agents/) — versioned protocol artifacts.

Consumer repos receive these via `npx @bwilliamson/mdcp-cli export --llms-index --fetch`, which caches prompts at `.agents/skills/mdcp/agents/` under the docs root. The fetched `mdcp.v*.llms.txt` references those paths.

The files in this directory mirror the spec for discoverability while migrating from the old `examples/prompts/` layout. Prefer [.agents/skills/mdcp/agents/README.md](../../.agents/skills/mdcp/agents/README.md) for the authoritative index.

Normative profile: [Agent task prompts](../../docs/features/protocol/agent-task-prompts.md).
