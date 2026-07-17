# Agent Skills

Portable packages of agent instructions (`SKILL.md` and companions) that hosts discover and load — the delivery model for MDCP’s **documentation system** guardrails. Upstream source in this monorepo is `skills/mdcp/`; consumers vendor via `npx skills add` into `.agents/skills/mdcp/` so agents learn how to shard, compile, validate, and maintain docs one piece at a time — across Cursor, Copilot, Claude Code, and similar hosts.

Verification: agentskills.io validation (`pnpm skill:validate` / skills-ref) in CI; [live skill eval](./live-skill-eval.md) is the optional local skill-creator loop.
