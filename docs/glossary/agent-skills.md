# Agent Skills

Portable packages of agent instructions (`SKILL.md` and companions) that hosts discover and load — the delivery model for MDCP’s documentation guardrails. Instead of fetching a monolithic `mdcp.v*.llms.txt` (llms-index) bootstrap file, MDCP ships as a vendored skill under `.agents/skills/mdcp/` so agents learn how to shard, compile, validate, and read docs one piece at a time across Cursor, Copilot, Claude Code, and similar hosts.

Verification is split: [skill content lint](./skill-content-lint.md) is the CI static check on `SKILL.md` text; [live skill eval](./live-skill-eval.md) is the optional local skill-creator loop.
