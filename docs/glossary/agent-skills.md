# Agent Skills

Portable packages of agent instructions (`SKILL.md` and companions) that hosts discover and load — the delivery model for MDCP’s **documentation system** guardrails. Upstream source in this monorepo is `skills/mdcp/`; consumers vendor via `npx skills add` into the **agent-specific** skills directory the skills CLI chooses so agents learn how to shard, compile, validate, and maintain docs one piece at a time — across Cursor, Copilot, Claude Code, and similar hosts. Per-agent install paths: [Supported Agents](https://github.com/vercel-labs/skills#supported-agents).

Verification: agentskills.io validation (`pnpm skill:validate` / skills-ref) in CI; [live skill eval](./live-skill-eval.md) is the optional local skill-creator loop.
