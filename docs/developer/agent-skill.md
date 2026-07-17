# Agent Skill development

Zero-friction MDCP delivery for AI agents uses the portable **parent** Agent Skill. Upstream source of truth is [`skills/mdcp/SKILL.md`](../../skills/mdcp/SKILL.md). After install (or local dogfood), agents load it from `.agents/skills/mdcp/`. Complementary helper skills under `skills/mdcp-*` (except WIP archetypes) ship in the same pack and are listed in [`skills.sh.json`](../../skills.sh.json) under **Documentation system**. Archetype skills (`skills/mdcp-arch-*`) are **not ready to release**: they carry `metadata.internal: true` and stay **out** of `skills.sh.json` until intentionally published. Maintainers can surface them locally with `INSTALL_INTERNAL_SKILLS=1`.

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
3. For archetypes (WIP), edit `skills/mdcp-arch-*` instead of growing the parent forever — do not highlight them in consumer install docs or `skills.sh.json` yet.
4. Run `pnpm skill:install` after skill edits so local agents pick up changes, then `pnpm skill:lint`, `pnpm skill:validate`, and `pnpm docs:check`.

## Verification

| Command               | Purpose                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm skill:lint`     | MDCP content lint on parent `SKILL.md` (phrases, frontmatter, line budget)                |
| `pnpm skill:validate` | [skills-ref](https://agentskills.io/specification) validate on all skills under `skills/` |
| `pnpm docs:check`     | Docs compile + lint gate after shard edits                                                |

Both skill gates run in local `pnpm check` and GitHub Actions CI. Neither is a [live skill eval](../glossary/live-skill-eval.md).

## Live skill evals (optional, local)

Qualitative with/without-skill grading is documented in [Live skill evals](./live-skill-evals.md) (suite inventory, layout contract, tooling). The glossary term is [live skill eval](../glossary/live-skill-eval.md). That loop is local-only — do **not** require Claude CLI or `skill-creator` in CI.

## Acceptance criteria

1. Parent skill is a valid Agent Skills package (`name: mdcp` matches folder under `skills/`).
2. Install documents the parent skill via `npx skills add` (complementary archetype skills stay unpublished in consumer docs until ready).
3. Parent skill encodes bootstrap / smallest-context / hard rules for docs-as-code agents.
4. Skill is host-agnostic — no Marketplace-only required steps.
5. [`skill content lint`](../glossary/skill-content-lint.md) (`pnpm skill:lint`) and `pnpm skill:validate` ([skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref)) pass locally and in CI for changes under `skills/` and `scripts/lint-mdcp-skill.mjs`.
6. [`skills.sh.json`](../../skills.sh.json) lists the parent and release-ready helpers in the **Documentation system** group — not WIP `mdcp-arch-*` packs.

## Publishing the skill pack

Ship `skills/mdcp/` as the consumer entrypoint; helper skills install from the same GitHub repo. Prefer:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

Complementary `skills/mdcp-arch-*` packs remain WIP (`metadata.internal: true`) — keep them off consumer get-started copy **and** out of [`skills.sh.json`](../../skills.sh.json) until ready to release. Maintainers can install them with `INSTALL_INTERNAL_SKILLS=1`.

There is no skills.sh submit API. The [repo page](https://skills.sh/betsalel-williamson/mdcp) appears from install telemetry after consumers (or maintainers) run an install without `DISABLE_TELEMETRY=1`. Release tagging syncs `metadata.version` on all skills under `skills/` — see [Versioning and releases](./versioning-and-releases.md).

Documented consumer install path: `.agents/skills/`. Avoid Cursor-only or Marketplace-only packaging for this work.

## `skills.sh.json` (repo page layout)

Repo-root [`skills.sh.json`](../../skills.sh.json) controls **how** the
[skills.sh repo page](https://skills.sh/betsalel-williamson/mdcp) groups skills
for humans browsing the catalog. Upstream reference:
[Customize repo pages](https://www.skills.sh/docs/customize).

### What it is (and is not)

| Does                                                                          | Does **not**                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| Curate section titles, descriptions, and skill order on the skills.sh page    | Change how `npx skills add` installs skills          |
| Decide which skills appear in named groups vs **Other skills** (`notGrouped`) | Replace `metadata.internal`, CI gates, or live evals |
| Match skill names/slugs from `skills/*/SKILL.md` `name:`                      | Act as a publish/submit registry                     |

Invalid or missing JSON falls back to the default installs-sorted list. Skills.sh
picks up edits after the repo is seen again by install telemetry; pages are
cached, so updates can lag.

### How it fits this repo

```text
skills/                     publishable Agent Skill packs (source of truth)
skills.sh.json              display groupings for the skills.sh repo page
tests/skills/*/evals/       optional live eval fixtures (not on skills.sh)
pnpm skill:lint|validate    CI/static gates on skills/ (not on skills.sh.json)
```

Current policy:

1. **Group release-ready packs** — the **Documentation system** grouping lists
   parent `mdcp` and helpers (`mdcp-getting-started`, `mdcp-doc-only`,
   `mdcp-design-architecture`, `mdcp-feature-level`, `mdcp-ux`). Keep parent
   first; order the rest for scanability.
2. **Omit WIP archetypes** — `skills/mdcp-arch-*` keep `metadata.internal:
true` and stay **out** of `skills.sh.json` until intentionally published.
   Maintainers use `INSTALL_INTERNAL_SKILLS=1` to install them locally.
3. **When adding a release-ready skill under `skills/`** — add its `name:` to
   the Documentation system `skills` array in the same PR. Do not add packs
   that still carry `metadata.internal: true`.
4. **Live evals are separate** — suite inventory and skill-creator loops live
   under [Live skill evals](./live-skill-evals.md). They never belong in
   `skills.sh.json`.

When changing skill surface area, update this file in the same PR, and follow
the skills.sh step in the
[release checklist](./versioning-and-releases.md#release-checklist-maintainers).

Consumer-facing landing identity (badge, README install commands) stays in
[Agent Skill](../features/agent-skill.md#ecosystem-publication).
