# Agent prompt templates (examples)

**Canonical source:** [spec/task-prompts/](../../spec/task-prompts/) — versioned protocol artifacts.

Consumer repos receive these via `mdcp export --llms-index --fetch`, which caches prompts at `.caches/mdcp/prompts/` under the docs root. The fetched `mdcp.v*.llms.txt` references those paths.

The files in this directory mirror the spec for discoverability while migrating from the old `examples/prompts/` layout. Prefer [spec/task-prompts/README.md](../../spec/task-prompts/README.md) for the authoritative index.

Normative profile: [Agent task prompts](../../docs/features/protocol/agent-task-prompts.md).
