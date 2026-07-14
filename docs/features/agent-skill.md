# Agent Skill delivery

MDCP ships as a portable **Agent Skills** pack so projects inherit documentation guardrails without installing a host-specific IDE extension. The **parent skill** is the intended agent entrypoint.

## Why skills instead of IDE extensions or llms-index alone

Compared with a custom IDE extension or a fetched llms-index plus extension packs, Agent Skills give:

- **Lower friction** — zero-install in the repo, or `npx skills add`
- **Host interoperability** — Cursor, Copilot, Claude Code, VS Code, and CLI hosts
- **Simpler maintenance** — markdown skill directories instead of host UI or dual index/pack formats
- **Composition** — parent skill plus complementary skills instead of one monolithic pack

## Parent skill and complementary skills

- `.agents/skills/mdcp/` — parent (bootstrap, hard rules, CLI, smallest-context)
- `.agents/skills/mdcp-arch-oss-library/` — OSS library archetype
- `.agents/skills/mdcp-arch-product-docs-site/` — product docs site archetype

## Format and location

- **Format:** `SKILL.md` per the [Agent Skills](https://agentskills.io) open standard.
- **Preferred path:** [`.agents/skills/mdcp/SKILL.md`](../../.agents/skills/mdcp/SKILL.md).
- **Also discovered:** `.github/skills/`, `.claude/skills/` (host-dependent aliases). Prefer documenting `.agents/skills/` only.

## Versioning Strategy (Vendoring)

Unlike the old extension pack system—which explicitly pinned `protocol.ref: "v0.4.1"` in `mdcp.config.json` and dynamically fetched artifacts into a `.caches/` directory—Agent Skills use a **vendoring** approach:

1. **Commit to Git:** When you run `npx skills add`, the skill's source files are copied directly into your project's `.agents/skills/` directory and tracked in your own source control.
2. **Docs-as-code Evolution:** The skill version is tied to the commit in your repository. This makes agent instruction changes explicitly reviewable in Pull Requests alongside the code or configuration changes they support.
3. **Upgrading:** To upgrade a skill, re-run the `npx skills add` command (or manually copy the updated folder), review the resulting `git diff`, and commit the changes.
4. **Authoring/Maintainer Versioning:** In the upstream `betsalel-williamson/mdcp` repository, the skills simply evolve on the `main` branch and are tagged alongside normal npm package releases (e.g., `v0.4.1`). Consumers can point `npx skills add` to specific tags if necessary, but the primary version constraint is what's committed to the consumer's repository.

## Install surfaces

```bash
# Parent skill
npx skills add betsalel-williamson/mdcp --skill mdcp

# Complementary skills
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-oss-library
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-product-docs-site
```

Zero-install: copy `.agents/skills/mdcp/` (and complementary skill directories when present) into the consumer repo.

## Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **Break it down:** Organize information into the smallest possible pieces (shards).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, or incident logs in the durable documentation.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

## Acceptance criteria

1. Parent skill is a valid Agent Skills package (`name: mdcp` matches folder).
2. Install documents parent + complementary skills via `npx skills add`.
3. Parent skill encodes bootstrap / smallest-context / hard rules formerly unique to the agent index.
4. Skill is host-agnostic — no Marketplace-only required steps.
5. [`skill content lint`](../glossary/skill-content-lint.md) (`pnpm skill:lint`) passes locally and in CI for changes under `.agents/skills/mdcp/` and `scripts/lint-mdcp-skill.mjs`.

## Content lint (CI)

Static analysis of the parent `SKILL.md` — required/forbidden phrases, frontmatter, and line budget. Fixtures live under `scripts/mdcp-skill-content-lint/` (monorepo CI only; not shipped with the skill). Run `pnpm skill:lint`. GitHub Actions runs the same gate so phrase regressions fail the PR. This is not a [live skill eval](../glossary/live-skill-eval.md).

## Live skill evals (optional, local)

Optional skill-creator agent runs and description trigger optimization use fixtures under `.agents/skills/mdcp/evals/`. Never required in CI.

## Ecosystem publication

Primary discovery: [skills.sh](https://skills.sh) via `npx skills`. Secondary registries later. Do not publish a VS Code Marketplace VSIX for this delivery path.

Landing identity for skills.sh:

- Root [README](../../README.md) includes the [install-count badge](https://www.skills.sh/docs#badge) (`https://skills.sh/b/betsalel-williamson/mdcp`) and `npx skills add` install commands.
- Repo-root [`skills.sh.json`](../../skills.sh.json) groups Core / Archetypes on the [skills.sh repo page](https://www.skills.sh/docs/customize).
