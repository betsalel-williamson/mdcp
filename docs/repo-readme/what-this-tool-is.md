# What this tool is

**mdcp** is an open standard and [Agent Skill](https://agentskills.io) for **technical documentation context**.

Instead of massive, unvalidated monolithic READMEs that overwhelm LLM context windows, MDCP organizes knowledge into small, validated Markdown **shards** (e.g. `docs/features/my-feature.md`). The MDCP Agent Skill trains your coding agents (in Cursor, Copilot, or Claude) to read these shards one by one, update them before coding, and validate them in CI.
