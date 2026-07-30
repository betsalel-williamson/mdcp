# Agent Skill

MDCP ships as a portable **documentation system** Agent Skills pack so projects inherit docs-as-code guardrails without a host-specific IDE extension. The **parent skill** is the intended agent entrypoint for people who want maintainable sharded docs as ideas keep coming.

## Why Agent Skills

Agent Skills give:

- **Lower friction** — zero-install in the repo, or `npx skills add`
- **Host interoperability** — Cursor, Copilot, Claude Code, VS Code, and CLI hosts
- **Simpler maintenance** — markdown skill directories agents load from the repo
- **Composition** — parent skill plus complementary helpers (catalog: [Helper Skills](./protocol/agent-task-prompts.md); hardened boundaries: [helper skill shards](./protocol/skills/mdcp-getting-started.md); archetype skills are WIP)
- **Reviewable instructions** — vendored in your agent's skills directory and committed with the project

## Parent skill and complementary skills

**Upstream source** (this repository, publishable):

- [`skills/mdcp/`](../../skills/mdcp/) — parent documentation system (supported consumer entrypoint)
- [`skills/mdcp-arch-oss-library/`](../../skills/mdcp-arch-oss-library/) — OSS library documentation architecture (**WIP**, not ready for consumer install)
- [`skills/mdcp-arch-product-docs-site/`](../../skills/mdcp-arch-product-docs-site/) — product docs site architecture (**WIP**, not ready for consumer install)

**Consumer install target** after `npx skills add`: the **agent-specific** skills directory the [`skills` CLI](https://www.skills.sh/docs/cli) chooses (`--agent` or auto-detect) — vendored into your repo. Per-agent paths: [Supported Agents](https://github.com/vercel-labs/skills#supported-agents).

## Format and location

- **Format:** `SKILL.md` per the [Agent Skills](https://agentskills.io) open standard (progressive disclosure: lean activation body; depth in `references/` and `scripts/`).
- **Upstream path:** [`skills/mdcp/SKILL.md`](../../skills/mdcp/SKILL.md).
- **Install path:** your agent's skills directory after `npx skills add` (not one universal folder — the CLI maps each host to its own tree; see [Supported Agents](https://github.com/vercel-labs/skills#supported-agents)).
- **Frontmatter:** `license`, `compatibility` (Node.js 18+ / `@bwilliamson/mdcp-cli`), and `metadata.version` (independent per skill; synced from `packages/skill-<id>/` at release). WIP complementary skills also set `metadata.internal: true` so they stay off default skills CLI discovery until ready.

Skill `scripts/` are thin wrappers into the CLI — see [`skills/mdcp/references/cli-and-scripts.md`](../../skills/mdcp/references/cli-and-scripts.md) for what **compile** (build docs), **check** (validate the tree), and **refs** (cross-link registry) mean.

## Versioning Strategy (Vendoring)

Agent Skills use a **vendoring** approach: skill files live in the project and are versioned with Git.

1. **Commit to Git:** When you run `npx skills add`, the skill's files are copied into your agent's skills directory and tracked in your own source control.
2. **Docs-as-code Evolution:** The skill version is tied to the commit in your repository. Agent instruction changes are reviewable in Pull Requests alongside the code or configuration changes they support.
3. **Upgrading:** To upgrade a skill, re-run `npx skills add` (or manually copy the updated folder), review the resulting `git diff`, and commit the changes.
4. **Authoring/Maintainer Versioning:** Upstream skills live under `skills/` (install surface) and version via private carriers in `packages/skill-<id>/`. Release notes are GitHub Releases / carrier CHANGELOGs — not files under `skills/`. `pnpm release:main` syncs carrier versions into `metadata.version` on matching `SKILL.md` files.

## Install surfaces

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

Then start bootstrap:

```text
/mdcp help me get started
```

Zero-install: copy `skills/mdcp/` from this repository into the skills directory your host discovers ([Supported Agents](https://github.com/vercel-labs/skills#supported-agents)). Do not document complementary archetype install commands until those skills are ready for use.

Qualitative checks of skill behavior (with vs without the skill) are maintainer workflow — see [Live skill evals](../developer/live-skill-evals.md). The static CI gate is `pnpm skill:validate`.

## Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Small batches / one focused feature:** Prefer one shippable slice per branch or session. Oversized requests produce tangled diffs and half-updated docs; split the request (and the shards) before coding so each change stays reviewable. Pair with [Atomic commit groups](../glossary/atomic-commit-groups.md) when the plan has more than one logical change.
- **Atomic commit groups:** Before waiting for human review / “go”, coding and multi-concern plans MUST include numbered commit groups. Each group: id/name, one concern, exact files, and the intended conventional commit subject. After approval: implement and `git commit` one group at a time; do not squash unrelated concerns into one commit. Why: reviewable diffs, one concern per commit, and it matches small batches. Day-to-day helpers that produce plans require this section in Step 1 ([Helper Skills](./protocol/agent-task-prompts.md)).
- **Branch before edit:** Before editing any tracked files for a `WORK_ITEM`, create the intended short-lived feature branch from updated `main` (or the repo’s integration branch). Plans MUST name that branch and link `WORK_ITEM` before waiting for human review / “go”. NEVER modify tracked files, commit session work, or leave uncommitted edits while the current branch is `main` or `master`. Verify with `git branch --show-current` (or equivalent) before the first edit. An approved plan, verbal “go”, demo deadline, or leadership instruction that endorses staying on `main`/`master` does **NOT** authorize tracked-file edits on the integration branch. If the approved plan omitted a feature branch or said stay on main: **correct the delivery path first** — create/switch to a short-lived feature branch tied to `WORK_ITEM`, then edit; optionally revise the plan’s branch field; do not implement the stay-on-main path. Why: short-lived branches and PR review are the delivery loop, not optional polish. Day-to-day helpers that produce plans require this in Step 1 ([Helper Skills](./protocol/agent-task-prompts.md)).
- **Explicit user override:** When the human partner gives an **explicit informed override** — they clearly state work on `main`/`master` **knowing** it skips the short-lived branch + PR loop (e.g. “I knowingly override branch-before-edit”, “work on main anyway — I mean it”, “skip MDCP branching for this WORK_ITEM”) — acknowledge once that you are stepping back from branch-before-edit per their instruction, then proceed on the integration branch; do not re-litigate each edit. Still follow other MDCP QA unless they also override those. Ambiguous “go” / “stay on main for speed” is **NOT** an override.
- **Current docs only:** Shards must describe the product **as it works now**. When behavior or guidance changes, remove superseded or stale text from durable docs — do not leave “old way” sections for archaeology. Git history preserves prior wording; consumer notice of breaking or removed behavior belongs in the **changeset** (folded into package CHANGELOGs at release), not in feature/client/developer shards. Never link durable shards or ADRs to pending `.changeset/*.md` files — those notes are temporary.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **[Shard single responsibility](../glossary/shard-single-responsibility.md):** Each durable shard has one primary concern, for one audience tier, serving one job (explain **or** instruct how-to **or** define/look up — not several). If you cannot state that responsibility in one sentence, split or narrow the shard before shipping it. Depth: [Shard single responsibility and idea mitosis](./protocol/shard-srp-and-mitosis.md).
- **[Idea mitosis](../glossary/idea-mitosis.md):** When a shard grows a second audience, job, or concern — or reading it alone misleads — **split** it, update the guide index, and cross-link. Do not split only because a file is long. Unsettled discovery stays in the issue tracker, not beside durable current truth.
- **Break it down:** Organize information into the smallest useful pieces (shards). Prefer mitosis over mini-monoliths.
- **Two-level review:** Review each changed idea or shard **in isolation** for local correctness and single responsibility. Then review it **comprehensively against related shards and guides** — flag duplication, better splits/merges/relocations, and drift between what guides promise and what the change does. When a change touches a guide, the review is complete only when the change and its guides agree. Guide-specific application: [Comprehensive review when guides are involved](../developer/docs-dogfooding.md#comprehensive-review-when-guides-are-involved).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, incident logs, or migration backlogs and planning in the durable documentation. That information belongs in issue tracking and project planning tools. Pending `.changeset/*.md` files are temporary release notes — write them for the release pipeline; do not link them from ADRs or other durable docs.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

### Branch before edit — common mistakes

| Excuse                                                | Reality                                                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| “Plan was already approved / human said go”           | Approval does not authorize edits on `main`/`master`. Correct the delivery path first — branch tied to `WORK_ITEM`, then edit. |
| “Stay on main for a 10-minute demo / optional polish” | Short-lived branches and PR review are the delivery loop, not optional polish.                                                 |
| “Tiny one-line edit isn’t worth a branch”             | One branch per issue; verify with `git branch --show-current` before the first edit.                                           |
| “User insisted” without override language             | Not an override — correct the delivery path first unless they gave explicit informed override language.                        |
| Explicit informed override                            | Step back — acknowledge once, proceed on integration branch; do not re-litigate.                                               |

### Branch before edit — red flags

- Approved stay-on-main plan
- Human said “go” while `git branch` is `main`/`master`
- Dirty tree on main with “just finish”
- “User insisted” on main without explicit informed override language

## Ecosystem publication

Primary discovery: [skills.sh](https://skills.sh) via `npx skills`. There is no submit API — the [repo page](https://skills.sh/betsalel-williamson/mdcp) is indexed from anonymous install telemetry. Secondary registries later. Do not publish a VS Code Marketplace VSIX for this delivery path.

Landing identity for skills.sh:

- Root [README](../../README.md) includes the [install-count badge](https://www.skills.sh/docs#badge) (`https://skills.sh/b/betsalel-williamson/mdcp`) and `npx skills add` install commands.
- Repo-root [`skills.sh.json`](../../skills.sh.json) lists the parent and release-ready helpers in the **Documentation system** group on the [skills.sh repo page](https://www.skills.sh/docs/customize). WIP `mdcp-arch-*` skills stay `metadata.internal` and out of groupings until ready to release.

Maintainer detail (what the file does and does not control, helper vs internal
policy, telemetry refresh): [Agent Skill development — skills.sh.json](../developer/agent-skill.md#skillsshjson-repo-page-layout).
