# What this tool is

**mdcp** is an [Agent Skill](https://agentskills.io) and toolchain for **technical documentation context**.

It is not a magic bullet — it is a helpful way to head off the long-term cost of poor docs. Instead of massive, unvalidated monolithic READMEs that overwhelm LLM context windows, MDCP helps you distill mind maps, architecture notes, specs, and product ideas into small, validated Markdown **shards** (e.g. `docs/features/my-feature.md`). The skill trains coding agents (in Cursor, Copilot, or Claude) to read those shards one by one, update them before coding, and validate them in CI — so people and AIs can trace value, learn the tools, and keep the system understandable as it grows. Works for a team of one or a full product, engineering, and marketing org.
