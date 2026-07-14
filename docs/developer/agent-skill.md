# Agent Skill

Zero-friction MDCP delivery for AI agents uses the portable Agent Skill at [`.agents/skills/mdcp/SKILL.md`](../../.agents/skills/mdcp/SKILL.md).

## Local dogfood

Agents in this repository should discover the skill automatically. Manual invoke (hosts that support slash skills): `/mdcp`.

When changing skill instructions:

1. Edit `.agents/skills/mdcp/SKILL.md`.
2. Keep protocol truths in `spec/llms-index/` and `spec/extensions/` — only teach discovery and workflow in the skill.
3. Update [Agent Skill delivery](../features/agent-skill.md) if location or publish guidance changes.
4. Run `pnpm docs:check` after docs shard edits.

## Publishing the skill bundle

Ship the `.agents/skills/mdcp/` directory (not a VS Code Marketplace VSIX). Consumers place it under `.agents/skills/mdcp/`, `.github/skills/mdcp/`, or `.cursor/skills/mdcp/` depending on host preferences. Prefer documenting `.agents/skills/` as the portable default.
