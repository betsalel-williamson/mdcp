# Agent Skill

MDCP ships as a portable **documentation system** Agent Skills pack so projects inherit docs-as-code guardrails without a host-specific IDE extension. The **parent skill** is the intended agent entrypoint for people who want maintainable sharded docs as ideas keep coming.

## Why Agent Skills

Agent Skills give:

- **Lower friction** — zero-install in the repo, or `npx skills add`
- **Host interoperability** — Cursor, Copilot, Claude Code, VS Code, and CLI hosts
- **Simpler maintenance** — markdown skill directories agents load from the repo
- **Composition** — parent skill plus complementary skills (archetype skills are WIP)
- **Reviewable instructions** — vendored under `.agents/skills/` and committed with the project

## Parent skill and complementary skills

**Upstream source** (this repository, publishable):

- [`skills/mdcp/`](../../skills/mdcp/) — parent documentation system (supported consumer entrypoint)
- [`skills/mdcp-arch-oss-library/`](../../skills/mdcp-arch-oss-library/) — OSS library documentation architecture (**WIP**, not ready for consumer install)
- [`skills/mdcp-arch-product-docs-site/`](../../skills/mdcp-arch-product-docs-site/) — product docs site architecture (**WIP**, not ready for consumer install)

**Consumer install target** after `npx skills add`: `.agents/skills/<name>/` (vendored into the consumer repo).

## Format and location

- **Format:** `SKILL.md` per the [Agent Skills](https://agentskills.io) open standard (progressive disclosure: lean activation body; depth in `references/` and `scripts/`).
- **Upstream path:** [`skills/mdcp/SKILL.md`](../../skills/mdcp/SKILL.md).
- **Install path:** `.agents/skills/mdcp/` (also discovered: `.github/skills/`, `.claude/skills/`). Prefer documenting `.agents/skills/` for consumers.
- **Frontmatter:** `license`, `compatibility` (Node.js 18+ / `@bwilliamson/mdcp-cli`), and `metadata.version` (lockstep with npm/git tags). WIP complementary skills also set `metadata.internal: true` so they stay off default skills CLI discovery until ready.

Skill `scripts/` are thin wrappers into the CLI — see [`skills/mdcp/references/cli-and-scripts.md`](../../skills/mdcp/references/cli-and-scripts.md) for what **compile** (build docs), **check** (validate the tree), and **refs** (cross-link registry) mean.

## Versioning Strategy (Vendoring)

Agent Skills use a **vendoring** approach: skill files live in the project and are versioned with Git.

1. **Commit to Git:** When you run `npx skills add`, the skill's files are copied into your project's `.agents/skills/` directory and tracked in your own source control.
2. **Docs-as-code Evolution:** The skill version is tied to the commit in your repository. Agent instruction changes are reviewable in Pull Requests alongside the code or configuration changes they support.
3. **Upgrading:** To upgrade a skill, re-run `npx skills add` (or manually copy the updated folder), review the resulting `git diff`, and commit the changes.
4. **Authoring/Maintainer Versioning:** Upstream skills live under `skills/` and evolve on `main`, tagged alongside npm package releases. `pnpm release:tag` sets `metadata.version` on every `skills/*/SKILL.md` to match the tag (preserves `metadata.internal`). Consumers can point `npx skills add` to specific tags if necessary.

## Install surfaces

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

Then start bootstrap:

```text
/mdcp help me get started
```

Zero-install: copy `skills/mdcp/` from this repository into the consumer's `.agents/skills/mdcp/`. Do not document complementary archetype install commands until those skills are ready for use.

Qualitative checks of skill behavior (with vs without the skill) are maintainer workflow — see [Live skill evals](../developer/live-skill-evals.md). Static gates remain `pnpm skill:lint` and `pnpm skill:validate`.

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

## Ecosystem publication

Primary discovery: [skills.sh](https://skills.sh) via `npx skills`. There is no submit API — the [repo page](https://skills.sh/betsalel-williamson/mdcp) is indexed from anonymous install telemetry. Secondary registries later. Do not publish a VS Code Marketplace VSIX for this delivery path.

Landing identity for skills.sh:

- Root [README](../../README.md) includes the [install-count badge](https://www.skills.sh/docs#badge) (`https://skills.sh/b/betsalel-williamson/mdcp`) and `npx skills add` install commands.
- Repo-root [`skills.sh.json`](../../skills.sh.json) lists the parent and release-ready helpers in the **Documentation system** group on the [skills.sh repo page](https://www.skills.sh/docs/customize). WIP `mdcp-arch-*` skills stay `metadata.internal` and out of groupings until ready to release.

Maintainer detail (what the file does and does not control, helper vs internal
policy, telemetry refresh): [Agent Skill development — skills.sh.json](../developer/agent-skill.md#skillsshjson-repo-page-layout).
