# Agent Skill

Zero-friction MDCP delivery for AI agents uses the portable **parent** Agent Skill. Upstream source of truth is [`skills/mdcp/SKILL.md`](../../skills/mdcp/SKILL.md). After install (or local dogfood), agents load it from `.agents/skills/mdcp/`. Complementary archetype skills under `skills/mdcp-arch-*` are **WIP** — keep them out of consumer get-started docs until ready.

The parent skill **succeeds** the agent-facing role of `mdcp.v*.llms.txt`.

## Local dogfood

Author under `skills/`. Then install into this repo for agents:

```bash
npx skills add . --skill mdcp
```

Installed copies under `.agents/skills/mdcp*` are gitignored so they do not duplicate upstream source. Manual invoke (hosts that support slash skills): `/mdcp`.

When changing skill instructions:

1. Edit `skills/mdcp/SKILL.md` (and `references/` as needed) — keep the activation body under 500 lines; put depth in `references/`.
2. Do **not** invent new protocol in the skill — CLI and schemas stay in packages.
3. For archetypes (WIP), edit `skills/mdcp-arch-*` instead of growing the parent forever — do not highlight them in consumer install docs yet.
4. Update [Agent Skill delivery](../features/agent-skill.md) when install or layout changes.
5. Run `pnpm skill:lint`, `pnpm skill:validate`, and `pnpm docs:check`.

## Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **Break it down:** Organize information into the smallest possible pieces (shards).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, or incident logs in the durable documentation.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

## Verification

| Command               | Purpose                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `pnpm skill:lint`     | MDCP content lint on parent `SKILL.md` (phrases, frontmatter, line budget)      |
| `pnpm skill:validate` | [skills-ref](https://agentskills.io/specification) validate on all three skills |
| `pnpm docs:check`     | Docs compile + lint gate after shard edits                                      |

Both skill gates run in local `pnpm check` and GitHub Actions CI. Neither is a [live skill eval](../glossary/live-skill-eval.md).

## Optional local improve loop

For qualitative description tuning and agent behavior checks, install Anthropic's `skill-creator` locally (`npx skills add anthropics/skills --skill skill-creator`) and use fixtures under `skills/mdcp/evals/`. That [live skill eval](../glossary/live-skill-eval.md) loop is local-only — do **not** require Claude CLI or `skill-creator` in CI.

## Publishing the skill pack

Ship `skills/mdcp/` as the consumer entrypoint. Complementary `skills/mdcp-arch-*` directories remain WIP — do not highlight them on get-started or skills.sh until ready. Prefer:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

Documented consumer install path: `.agents/skills/`. Avoid Cursor-only or Marketplace-only packaging for this work.
