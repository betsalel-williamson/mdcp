# Agent Skill

Zero-friction MDCP delivery for AI agents uses the portable **parent** Agent Skill at [`.agents/skills/mdcp/SKILL.md`](../../.agents/skills/mdcp/SKILL.md). Complementary skills (prompts, archetypes, format packs) migrate from [complementary skills](../../spec/extensions/) into sibling directories under `.agents/skills/`.

The parent skill **succeeds** the agent-facing role of `mdcp.v*.llms.txt`. Keep `spec/llms-index/` and extension packs only while migration issues remain open.

## Local dogfood

Agents in this repository should discover `.agents/skills/mdcp/` automatically. Manual invoke (hosts that support slash skills): `/mdcp`.

When changing skill instructions:

1. Edit `.agents/skills/mdcp/SKILL.md` (and `references/` as needed).
2. Do **not** invent new protocol in the skill — CLI and schemas stay in packages / `spec/schemas`.
3. For prompts, archetypes, or format packs, prefer complementary skills (or land them via migration issues) instead of growing the parent forever.
4. Update [Agent Skill delivery](../features/agent-skill.md) when install or migration phases change.
5. Run `pnpm skill:lint` and `pnpm docs:check`.

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

| Command           | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| `pnpm skill:lint` | Static content lint on parent `SKILL.md` (phrases, frontmatter) |
| `pnpm docs:check` | Docs compile + lint gate after shard edits                      |

`skill:lint` is the [skill content lint](../glossary/skill-content-lint.md) gate. It is required in local `pnpm check` and in GitHub Actions CI. It is **not** a [live skill eval](../glossary/live-skill-eval.md). Changes to the skill or `scripts/lint-mdcp-skill.mjs` must keep that step green.

## Optional local improve loop

For qualitative description tuning and agent behavior checks, install Anthropic's `skill-creator` locally (`npx skills add anthropics/skills --skill skill-creator`) and use fixtures under `.agents/skills/mdcp/evals/`. That [live skill eval](../glossary/live-skill-eval.md) loop is local-only — do **not** require Claude CLI or `skill-creator` in CI.

## Publishing the skill pack

Ship `.agents/skills/mdcp/` (and complementary skill directories as they migrate). Prefer:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

Documented portable path: `.agents/skills/`. Avoid Cursor-only or Marketplace-only packaging for this work.
