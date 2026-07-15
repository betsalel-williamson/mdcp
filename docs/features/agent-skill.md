# Agent Skill delivery

MDCP ships as a portable **documentation system** Agent Skills pack so projects inherit docs-as-code guardrails without a host-specific IDE extension. The **parent skill** is the intended agent entrypoint for people who want maintainable sharded docs as ideas keep coming.

## Why skills instead of IDE extensions or llms-index alone

Compared with a custom IDE extension or a fetched llms-index plus extension packs, Agent Skills give:

- **Lower friction** — zero-install in the repo, or `npx skills add`
- **Host interoperability** — Cursor, Copilot, Claude Code, VS Code, and CLI hosts
- **Simpler maintenance** — markdown skill directories instead of host UI or dual index/pack formats
- **Composition** — parent skill plus complementary skills instead of one monolithic pack

## Parent skill and complementary skills

**Upstream source** (this repository, publishable):

- [`skills/mdcp/`](../../skills/mdcp/) — parent documentation system
- [`skills/mdcp-arch-oss-library/`](../../skills/mdcp-arch-oss-library/) — OSS library documentation architecture
- [`skills/mdcp-arch-product-docs-site/`](../../skills/mdcp-arch-product-docs-site/) — product docs site architecture

**Consumer install target** after `npx skills add`: `.agents/skills/<name>/` (vendored into the consumer repo).

## Format and location

- **Format:** `SKILL.md` per the [Agent Skills](https://agentskills.io) open standard (progressive disclosure: lean activation body; depth in `references/` and `scripts/`).
- **Upstream path:** [`skills/mdcp/SKILL.md`](../../skills/mdcp/SKILL.md).
- **Install path:** `.agents/skills/mdcp/` (also discovered: `.github/skills/`, `.claude/skills/`). Prefer documenting `.agents/skills/` for consumers.
- **Frontmatter:** `license`, `compatibility` (Node.js 24+ / npx / `@bwilliamson/mdcp-cli`), and `metadata.version` (lockstep with npm/git tags).

Skill `scripts/` are thin wrappers into the CLI — see [`skills/mdcp/references/cli-and-scripts.md`](../../skills/mdcp/references/cli-and-scripts.md) for what **compile** (build docs), **check** (validate the tree), and **refs** (cross-link registry) mean.

## Versioning Strategy (Vendoring)

Unlike the old extension pack system—which explicitly pinned `protocol.ref: "v0.4.1"` in `mdcp.config.json` and dynamically fetched artifacts into a `.caches/` directory—Agent Skills use a **vendoring** approach:

1. **Commit to Git:** When you run `npx skills add`, the skill's files are copied into your project's `.agents/skills/` directory and tracked in your own source control.
2. **Docs-as-code Evolution:** The skill version is tied to the commit in your repository. This makes agent instruction changes explicitly reviewable in Pull Requests alongside the code or configuration changes they support.
3. **Upgrading:** To upgrade a skill, re-run the `npx skills add` command (or manually copy the updated folder), review the resulting `git diff`, and commit the changes.
4. **Authoring/Maintainer Versioning:** Upstream skills live under `skills/` and evolve on `main`, tagged alongside npm package releases (e.g., `v0.4.1`). Bump `metadata.version` on all three publishable skills with the same release. Consumers can point `npx skills add` to specific tags if necessary.

## Install surfaces

```bash
# Parent skill
npx skills add betsalel-williamson/mdcp --skill mdcp

# Complementary skills
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-oss-library
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-product-docs-site
```

Zero-install: copy `skills/mdcp/` (and complementary skill directories) from this repository into the consumer's `.agents/skills/`.

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

1. Parent skill is a valid Agent Skills package (`name: mdcp` matches folder under `skills/`).
2. Install documents parent + complementary skills via `npx skills add`.
3. Parent skill encodes bootstrap / smallest-context / hard rules formerly unique to the agent index.
4. Skill is host-agnostic — no Marketplace-only required steps.
5. [`skill content lint`](../glossary/skill-content-lint.md) (`pnpm skill:lint`) and `pnpm skill:validate` ([skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref)) pass locally and in CI for changes under `skills/` and `scripts/lint-mdcp-skill.mjs`.

## Content lint and spec validation (CI)

- `pnpm skill:lint` — MDCP-specific static analysis of the parent `SKILL.md` (required/forbidden phrases, frontmatter, line budget). Fixtures live under `scripts/mdcp-skill-content-lint/` (monorepo CI only; not shipped with the skill).
- `pnpm skill:validate` — `skills-ref validate` on each publishable skill under `skills/` (agentskills.io frontmatter and naming).

Both run in GitHub Actions. Neither is a [live skill eval](../glossary/live-skill-eval.md).

## Live skill evals (optional, local)

Optional skill-creator agent runs and description trigger optimization use fixtures under `skills/mdcp/evals/`. Never required in CI.

## Ecosystem publication

Primary discovery: [skills.sh](https://skills.sh) via `npx skills`. Secondary registries later. Do not publish a VS Code Marketplace VSIX for this delivery path.

Landing identity for skills.sh:

- Root [README](../../README.md) includes the [install-count badge](https://www.skills.sh/docs#badge) (`https://skills.sh/b/betsalel-williamson/mdcp`) and `npx skills add` install commands.
- Repo-root [`skills.sh.json`](../../skills.sh.json) groups Documentation system / Documentation architectures on the [skills.sh repo page](https://www.skills.sh/docs/customize).
