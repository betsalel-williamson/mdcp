# Agent Skill development

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
4. Run `pnpm skill:install` after skill edits so local agents pick up changes, then `pnpm skill:lint`, `pnpm skill:validate`, and `pnpm docs:check`.

## Verification

| Command               | Purpose                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `pnpm skill:lint`     | MDCP content lint on parent `SKILL.md` (phrases, frontmatter, line budget)      |
| `pnpm skill:validate` | [skills-ref](https://agentskills.io/specification) validate on all three skills |
| `pnpm docs:check`     | Docs compile + lint gate after shard edits                                      |

Both skill gates run in local `pnpm check` and GitHub Actions CI. Neither is a [live skill eval](../glossary/live-skill-eval.md).

## Live skill evals (optional, local)

For qualitative description tuning and agent behavior checks, use the vendored Anthropic [`skill-creator`](../../.agents/skills/skill-creator/SKILL.md) skill at `.agents/skills/skill-creator/` with fixtures under [`skills/mdcp/evals/`](../../skills/mdcp/evals/README.md). Refresh from upstream with `npx skills add anthropics/skills --skill skill-creator` when needed. That [live skill eval](../glossary/live-skill-eval.md) loop is local-only — do **not** require Claude CLI or `skill-creator` in CI. Workspace results: `skills/mdcp-workspace/`.

## Acceptance criteria

1. Parent skill is a valid Agent Skills package (`name: mdcp` matches folder under `skills/`).
2. Install documents the parent skill via `npx skills add` (complementary archetype skills stay unpublished in consumer docs until ready).
3. Parent skill encodes bootstrap / smallest-context / hard rules for docs-as-code agents.
4. Skill is host-agnostic — no Marketplace-only required steps.
5. [`skill content lint`](../glossary/skill-content-lint.md) (`pnpm skill:lint`) and `pnpm skill:validate` ([skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref)) pass locally and in CI for changes under `skills/` and `scripts/lint-mdcp-skill.mjs`.

## Publishing the skill pack

Ship `skills/mdcp/` as the consumer entrypoint. Complementary `skills/mdcp-arch-*` directories remain WIP (`metadata.internal: true`) — do not highlight them on get-started or skills.sh until ready. Prefer:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

There is no skills.sh submit API. The [repo page](https://skills.sh/betsalel-williamson/mdcp) appears from install telemetry after consumers (or maintainers) run the command above without `DISABLE_TELEMETRY=1`. Release tagging syncs `metadata.version` on all skills under `skills/` — see [Versioning and releases](./versioning-and-releases.md).

Documented consumer install path: `.agents/skills/`. Avoid Cursor-only or Marketplace-only packaging for this work.
