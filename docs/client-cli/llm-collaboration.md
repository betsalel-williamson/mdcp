# LLM collaboration

Spec-driven subagents and workflow for coding agents under the parent MDCP Agent Skill. For the problems mdcp solves and which commands address them, see [Why mdcp for coding agents](./why-mdcp-for-agents.md).

**Source of truth:** versioned subagent instructions live under [skills/mdcp/agents/](../../skills/mdcp/agents/). After `npx skills add`, the same files land under `.agents/skills/mdcp/agents/` in the consumer repo. This page indexes them and covers mdcp-specific workflow — not full agent text. Skill-side invoke recipe: [`skills/mdcp/references/agents.md`](../../skills/mdcp/references/agents.md).

## How to call subagents

Agent Skills discover only directories with `SKILL.md`. The portable slash entrypoint is **`/mdcp`** (the parent skill). Files under `agents/` are **resources** of that skill — not separate slash commands like `/mdcp:feature-level`.

1. Activate the parent skill: `/mdcp` (hosts that support slash skills), or let the host auto-load from the skill description.
2. Name the **subagent id** in the same turn (for example `feature-level` or `getting-started`).
3. Fill that file’s **Replace before sending** block (`WORK_ITEM`, `WORK_ITEM_LOOKUP`, or bootstrap fields such as `FEATURE=` / `PERSONA=`).
4. The agent **reads** `.agents/skills/mdcp/agents/<id>.md` (after install) or `skills/mdcp/agents/<id>.md` (upstream) and follows it.

**Fallback** (hosts without slash skills): attach or open the same `agents/<id>.md` path. Same content; not a different delivery model.

**Optional:** hosts that can fork work (Cursor Task, Claude `context: fork`, and similar) may spawn an isolated agent with that markdown as the task prompt.

## Subagents

| Id                    | When to use                                       | Path after install                                  |
| --------------------- | ------------------------------------------------- | --------------------------------------------------- |
| `getting-started`     | Bootstrap MDCP in a consumer repo                 | `.agents/skills/mdcp/agents/getting-started.md`     |
| `doc-only`            | Documentation-only work                           | `.agents/skills/mdcp/agents/doc-only.md`            |
| `design-architecture` | RFCs, ADRs, data models                           | `.agents/skills/mdcp/agents/design-architecture.md` |
| `feature-level`       | Feature work, docs-first then TDD                 | `.agents/skills/mdcp/agents/feature-level.md`       |
| `ux`                  | UI flows and client-guide updates                 | `.agents/skills/mdcp/agents/ux.md`                  |
| `review`              | Architecture and security review; atomic findings | `.agents/skills/mdcp/agents/review.md`              |

Upstream copies: [skills/mdcp/agents/](../../skills/mdcp/agents/). Each subagent uses a **Replace before sending** block at the top; the agent plans from repo context rather than vendor-specific commands baked into the template.

## Bootstrap (getting-started)

First-time setup for a consumer repo: activate `/mdcp`, name `getting-started`, and fill `FEATURE=` and `PERSONA=` in [getting-started.md](../../skills/mdcp/agents/getting-started.md).

The subagent instructs the agent to inspect the repository and mdcp docs before installing or configuring. Best for **Learner** and **Author** archetypes — see [Personas and priority tiers](../features/personas-and-priority-tiers.md).

## Follow-up turns

Use these after the pipeline exists (inline here — not duplicated in `skills/mdcp/agents/`). Prefer activating `/mdcp` first so docs-as-code rules stay in context.

**Add documentation for a new feature:**

```markdown
Add shards for feature "{{FEATURE}}" under `docs/features/`, update `docs/developer/` if maintainer workflows changed, and add an end-user section under `docs/client/`.
Update each guide's `index.md`, then run this repo's mdcp compile and check commands.
Discover shards with host search (`rg`, IDE search). Validate cross-links with `mdcp check` (optional `mdcp refs list`). Do not edit generated compile output by hand.
```

**Fix validation failures:**

```markdown
Documentation check failed. Read the error output, fix only shard `.md` files and config if needed, then re-run until check passes.
Use `mdcp check` (and optional `mdcp refs list`) to correct broken fragment links.
```

**Regenerate after TOC change:**

```markdown
I updated `index.md` in guide `{{GUIDE_NAME}}`. Run mdcp compile and check using this repo's documented commands.
```

## Docs-first feature workflow

Load scope from the tracker via `WORK_ITEM_LOOKUP` (GitHub MCP, `gh issue view`, Linear MCP, or your repo's documented integration). Then document before you implement — activate `/mdcp` and use the `feature-level` subagent ([feature-level.md](../../skills/mdcp/agents/feature-level.md)).

### Workflow best practices

- **Branch first** — create a feature branch from updated `main` before shards, tests, or code (see [Agent work-item tracking](../developer/agent-work-item-tracking.md))
- **One issue per branch** — stay focused on a single feature, design, or doc scope; do not mix unrelated work in one PR
- **Current behavior in docs** — shards describe the product as it works now; removed or breaking behavior belongs in the **changeset**, not `docs/features/` or `docs/client/`

| Phase     | Where            | Holds                                                  |
| --------- | ---------------- | ------------------------------------------------------ |
| Document  | `docs/features/` | Capabilities, design, API surface, acceptance criteria |
| Document  | `docs/client/`   | End-user value, experience, how to use the feature     |
| Implement | Code + tests     | TDD against the documented contract                    |

For architecture-heavy work before coding (RFCs, ADRs, data models), use the `design-architecture` subagent ([design-architecture.md](../../skills/mdcp/agents/design-architecture.md)).

### Sharding keeps context lean

- **Core workflow** — `/mdcp` plus repo script wiring
- **On demand** — one subagent from `skills/mdcp/agents/` (or `.agents/skills/mdcp/agents/` after install); load only what the current task needs
- **Compiled context** — `mdcp export --llm` for token-stripped output scoped to registered guides

Prefer named subagents under the parent skill over permanently importing rigid always-on rules into every repo.

## Work item tracking

Task-type subagents include a **Replace before sending** block with `WORK_ITEM` and `WORK_ITEM_LOOKUP`:

- **`WORK_ITEM`** — ticket identifier or URL
- **`WORK_ITEM_LOOKUP`** — where the agent loads scope and delivery conventions (do not hard-code a tracker in the subagent file)

Point `WORK_ITEM_LOOKUP` at a shard under `docs/developer/` in your repo. The agent discovers GitHub MCP, `gh issue view`, Linear MCP, or other tools from that doc — not from the subagent template.

This repository documents its stack in [Agent work-item tracking](../developer/agent-work-item-tracking.md) — use that path in `WORK_ITEM_LOOKUP` when dogfooding mdcp.

## Toolchain integration

mdcp exposes a **tool-agnostic contract**: agents need shell access and the ability to edit `.md` files.

- **Cursor / Composer** — activate `/mdcp`, name the subagent id, fill the Replace block; optionally attach `agents/<id>.md`; run the repo's doc check before ending a turn
- **Terminal agents** — load `SKILL.md` then the matching `agents/<id>.md`; or start with `mdcp export --llm` output; edit shards only; verify with the repo's doc check
- **CI / headless agents** — wire npm scripts; `mdcp check` exit code is the quality gate
- **Cross-links** — discover with host search; validate fragments with `mdcp check` (optional `mdcp refs list`)

Example npm scripts:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --docs-root docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint",
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --docs-root docs"
  }
}
```

For npm script stubs only, see [Agent integration](./agent-integration.md).

## Three-tier doc layout

Split documentation into three guides:

| Guide directory   | Audience                   | Typical content                                                    |
| ----------------- | -------------------------- | ------------------------------------------------------------------ |
| `docs/features/`  | Maintainers, coding agents | What the product does — capabilities, design, API surface          |
| `docs/developer/` | Maintainers, contributors  | How to work on the repo — setup, layout, tests, releases           |
| `docs/client/`    | End users                  | How to use the product; persona and scope in `about-this-guide.md` |

Each guide directory needs:

- `index.md` — human table of contents (links to shard files; compile order comes from link order here)
- Topic shards — one file per section (for example `authentication.md`)
- Optional `about-this-guide.md` — preamble shard (persona, scope)

When a manifest has preamble prose with example links (not section shards), set `compile.sectionsHeading` in config (see [Manifest compile order](../features/manifest-compile-order.md)).

Never hand-edit generated compile output or `refs.json`.

**Worked example:** this repository dogfoods under [`docs/features/`](../features/), [`docs/developer/`](../developer/), and [`docs/client-cli/`](./), wired by [`docs/mdcp.config.json`](../mdcp.config.json). Minimal fixture: [examples/sample-guides](../../examples/sample-guides/).

## Human review checklist

When reviewing an agent's documentation PR:

- Only shard `.md` files and config changed — not hand-edited generated compile output or `refs.json`
- `index.md` link order matches intended compile order (use `compile.sectionsHeading` when the manifest has preamble example links)
- Doc check passes locally and in CI (repo's documented commands)
- Cross-links pass `mdcp check` (optional `mdcp refs list` to inspect slugs), not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`
- Subagents use only the top replace block — fill in `WORK_ITEM` and `WORK_ITEM_LOOKUP` before sending
- One WORK_ITEM per PR — branch and scope match a single feature or design
- Shards describe current behavior; breaking or removed behavior is in the changeset, not feature/client guides

## See also

- [Why mdcp for coding agents](./why-mdcp-for-agents.md) — developer pain and which commands address it
- [Agent integration](./agent-integration.md) — npm scripts quick reference
- [skills/mdcp/references/agents.md](../../skills/mdcp/references/agents.md) — invoke recipe and id table
- [skills/mdcp/agents/](../../skills/mdcp/agents/) — versioned subagent instruction files
- [Project layout](./project-layout.md) — shard directory structure
- [Cross-links and refs](./cross-links-and-refs.md) — validate fragments after compile
- [Optional linters](./optional-linters.md) — markdownlint, Vale, link check peers
