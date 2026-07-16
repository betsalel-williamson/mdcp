# Agent Skill

Zero-friction MDCP delivery for AI agents uses the portable **parent** Agent Skill. Upstream source of truth is [`skills/mdcp/SKILL.md`](../../skills/mdcp/SKILL.md). After install (or local dogfood), agents load it from `.agents/skills/mdcp/`. Complementary archetype skills under `skills/mdcp-arch-*` are **WIP**: they carry `metadata.internal: true` so the skills CLI hides them from default `--list` / public install prompts. Keep them out of consumer get-started docs and [`skills.sh.json`](../../skills.sh.json) until ready. Maintainers can surface them with `INSTALL_INTERNAL_SKILLS=1`.

## Local dogfood

Author under `skills/`. Then install into this repo for agents:

```bash
pnpm skill:install
```

That runs `npx skills add . --skill mdcp` and copies the parent skill into `.agents/skills/mdcp/`.

Installed copies under `.agents/skills/mdcp*` are gitignored so they do not duplicate upstream source. Manual invoke (hosts that support slash skills): `/mdcp`. First-time consumer bootstrap: `/mdcp help me get started`.

When changing skill instructions:

1. Edit `skills/mdcp/SKILL.md` (and `references/` as needed) — keep the activation body under 500 lines; put depth in `references/`.
2. Do **not** invent new protocol in the skill — CLI and schemas stay in packages.
3. For archetypes (WIP), edit `skills/mdcp-arch-*` instead of growing the parent forever — do not highlight them in consumer install docs yet.
4. Update [Agent Skill delivery](../features/agent-skill.md) when install or layout changes.
5. Run `pnpm skill:install` after skill edits so local agents pick up changes, then `pnpm skill:lint`, `pnpm skill:validate`, and `pnpm docs:check`.

## Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Current docs only:** Shards must describe the product **as it works now**. When behavior or guidance changes, remove superseded or stale text from durable docs — do not leave “old way” sections for archaeology. Git history preserves prior wording; consumer notice of breaking or removed behavior belongs in the **changeset** (folded into package CHANGELOGs at release), not in feature/client/developer shards. Never link durable shards or ADRs to pending `.changeset/*.md` files — those notes are temporary.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **Break it down:** Organize information into the smallest possible pieces (shards).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, incident logs, or migration backlogs and planning in the durable documentation. That information belongs in issue tracking and project planning tools. Pending `.changeset/*.md` files are temporary release notes — write them for the release pipeline; do not link them from ADRs or other durable docs.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

## Verification

| Command               | Purpose                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `pnpm skill:lint`     | MDCP content lint on parent `SKILL.md` (phrases, frontmatter, line budget)      |
| `pnpm skill:validate` | [skills-ref](https://agentskills.io/specification) validate on all three skills |
| `pnpm docs:check`     | Docs compile + lint gate after shard edits                                      |

Both skill gates run in local `pnpm check` and GitHub Actions CI. Neither is a [live skill eval](../glossary/live-skill-eval.md).

## Optional local improve loop

For qualitative description tuning and agent behavior checks, use the vendored Anthropic [`skill-creator`](../../.agents/skills/skill-creator/SKILL.md) skill at `.agents/skills/skill-creator/` with fixtures under [`skills/mdcp/evals/`](../../skills/mdcp/evals/README.md). Refresh from upstream with `npx skills add anthropics/skills --skill skill-creator` when needed. That [live skill eval](../glossary/live-skill-eval.md) loop is local-only — do **not** require Claude CLI or `skill-creator` in CI.

## Publishing the skill pack

Ship `skills/mdcp/` as the consumer entrypoint. Complementary `skills/mdcp-arch-*` directories remain WIP (`metadata.internal: true`) — do not highlight them on get-started or skills.sh until ready. Prefer:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

There is no skills.sh submit API. The [repo page](https://skills.sh/betsalel-williamson/mdcp) appears from install telemetry after consumers (or maintainers) run the command above without `DISABLE_TELEMETRY=1`. Release tagging syncs `metadata.version` on all skills under `skills/` — see [Versioning and releases](./versioning-and-releases.md).

Documented consumer install path: `.agents/skills/`. Avoid Cursor-only or Marketplace-only packaging for this work.
