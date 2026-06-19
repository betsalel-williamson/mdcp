# Agent prompt templates (examples)

**Canonical source:** [spec/extensions/prompts-mdcp-defaults/0.4.0.0/](../../spec/extensions/prompts-mdcp-defaults/0.4.0.0/) — versioned protocol artifacts.

Consumer repos receive these via `npx @bwilliamson/mdcp-cli export --llms-index --fetch`, which caches prompts at `.caches/mdcp/prompts/` under the docs root. The fetched `mdcp.v*.llms.txt` references those paths.

The files in this directory mirror the spec for discoverability while migrating from the old `examples/prompts/` layout. Prefer [spec/extensions/prompts-mdcp-defaults/0.4.0.0/README.md](../../spec/extensions/prompts-mdcp-defaults/0.4.0.0/README.md) for the authoritative index.

Normative profile: [Agent task prompts](../../docs/features/protocol/agent-task-prompts.md).
