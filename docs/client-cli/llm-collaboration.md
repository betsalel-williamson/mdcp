# LLM collaboration

Spec-driven prompts and workflow for coding agents. For the problems mdcp solves and which commands address them, see [Why mdcp for coding agents](./why-mdcp-for-agents.md).

**Source of truth:** versioned prompts live under [spec/extensions/prompts-mdcp-defaults/0.4.0.0/](../../spec/extensions/prompts-mdcp-defaults/0.4.0.0/). `mdcp export --llms-index --fetch` caches them at `.agents/skills/mdcp/agents/` in your docs root. This page indexes them and covers mdcp-specific workflow — not full prompt text.

## Prompt library

Copy from [.agents/skills/mdcp/agents/](../../.agents/skills/mdcp/agents/).

- [getting-started.md](../../.agents/skills/mdcp/agents/getting-started.md) — first-time pipeline setup in a consumer repo
- [doc-only.md](../../.agents/skills/mdcp/agents/doc-only.md) — documentation-only work
- [design-architecture.md](../../.agents/skills/mdcp/agents/design-architecture.md) — RFCs, ADRs, data models
- [feature-level.md](../../.agents/skills/mdcp/agents/feature-level.md) — feature work, docs-first then TDD
- [ux.md](../../.agents/skills/mdcp/agents/ux.md) — UI flows and client-guide updates
- [review.md](../../.agents/skills/mdcp/agents/review.md) — architecture and security review; one node per PR; atomic findings

Each prompt uses a **Replace before sending** code block at the top; the agent plans from repo context rather than vendor-specific commands baked into the template.

## Bootstrap prompt (copy-paste)

First-time setup for a consumer repo: [getting-started.md](../../.agents/skills/mdcp/agents/getting-started.md).

Fill in `FEATURE=` and `PERSONA=`, then send. The prompt instructs the agent to inspect the repository and mdcp docs before installing or configuring. Best for **Learner** and **Author** archetypes — see [Personas and priority tiers](../features/personas-and-priority-tiers.md).

## Follow-up prompts

Use these after the pipeline exists (inline here — not duplicated in `spec/extensions/prompts-mdcp-defaults/0.4.0.0/`).

**Add documentation for a new feature:**

```markdown
Add shards for feature "{{FEATURE}}" under `docs/features/`, update `docs/developer/` if maintainer workflows changed, and add an end-user section under `docs/client/`.
Update each guide's `index.md`, then run this repo's mdcp compile and check commands.
Use `mdcp refs lookup` for every cross-link. Do not edit generated compile output by hand.
```

**Fix validation failures:**

```markdown
Documentation check failed. Read the error output, fix only shard `.md` files and config if needed, then re-run until check passes.
Use `mdcp refs lookup` to correct broken fragment links.
```

**Regenerate manifest after TOC change:**

```markdown
I updated `index.md` in guide `{{GUIDE_NAME}}`. Run mdcp compile and check using this repo's documented commands.
```

## Docs-first feature workflow

Load scope from the tracker via `WORK_ITEM_LOOKUP` (GitHub MCP, `gh issue view`, Linear MCP, or your repo's documented integration). Then document before you implement — use [feature-level.md](../../.agents/skills/mdcp/agents/feature-level.md).

### Workflow best practices

- **Branch first** — create a feature branch from updated `main` before shards, tests, or code (see [Agent work-item tracking](../developer/agent-work-item-tracking.md))
- **One issue per branch** — stay focused on a single feature, design, or doc scope; do not mix unrelated work in one PR
- **Current behavior in docs** — shards describe the product as it works now; removed or breaking behavior belongs in the **changeset**, not `docs/features/` or `docs/client/`

| Phase     | Where            | Holds                                                  |
| --------- | ---------------- | ------------------------------------------------------ |
| Document  | `docs/features/` | Capabilities, design, API surface, acceptance criteria |
| Document  | `docs/client/`   | End-user value, experience, how to use the feature     |
| Implement | Code + tests     | TDD against the documented contract                    |

For architecture-heavy work before coding (RFCs, ADRs, data models), use [design-architecture.md](../../.agents/skills/mdcp/agents/design-architecture.md).

### Sharding keeps context lean

- **Core workflow** — bootstrap prompt and repo script wiring
- **On demand** — task-type prompts from `.agents/skills/mdcp/agents/` or `spec/extensions/prompts-mdcp-defaults/0.4.0.0/`; load only what the current task needs
- **Compiled context** — `mdcp export --llm` for token-stripped output scoped to registered guides

Prefer structured prompts over permanently importing rigid always-on rules into every repo.

## Work item tracking

Task-type prompts include a **Replace before sending** block with `WORK_ITEM` and `WORK_ITEM_LOOKUP`:

- **`WORK_ITEM`** — ticket identifier or URL
- **`WORK_ITEM_LOOKUP`** — where the agent loads scope and delivery conventions (do not hard-code a tracker in the prompt)

Point `WORK_ITEM_LOOKUP` at a shard under `docs/developer/` in your repo. The agent discovers GitHub MCP, `gh issue view`, Linear MCP, or other tools from that doc — not from the prompt template.

This repository documents its stack in [Agent work-item tracking](../developer/agent-work-item-tracking.md) — use that path in `WORK_ITEM_LOOKUP` when dogfooding mdcp.

## Task-type prompt templates

- [doc-only.md](../../.agents/skills/mdcp/agents/doc-only.md) — technical writers; documentation, tutorials, guides
- [design-architecture.md](../../.agents/skills/mdcp/agents/design-architecture.md) — architects; RFCs, ADRs, data models before code
- [feature-level.md](../../.agents/skills/mdcp/agents/feature-level.md) — server-side or full-stack feature work
- [ux.md](../../.agents/skills/mdcp/agents/ux.md) — UX and frontend; flows, accessibility, client guides
- [review.md](../../.agents/skills/mdcp/agents/review.md) — security and systems review; atomic findings, checklist evidence, feature stubs

## Toolchain integration

mdcp exposes a **tool-agnostic contract**: agents need shell access and the ability to edit `.md` files.

- **Cursor / Composer** — paste prompts from `.agents/skills/mdcp/agents/` or `spec/extensions/prompts-mdcp-defaults/0.4.0.0/`; reference shard files for context; run the repo's doc check before ending a turn
- **Terminal agents** — start with `mdcp export --llm` output; edit shards only; verify with the repo's doc check
- **CI / headless agents** — wire npm scripts; `mdcp check` exit code is the quality gate
- **Cross-links** — `mdcp refs lookup "topic" --format json` before inserting fragment links

Example npm scripts:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --docs-root docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint",
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --docs-root docs",
    "docs:refs": "mdcp refs lookup"
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
- Cross-links use slugs from `mdcp refs lookup`, not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`
- Task prompts use only the top replace block — fill in `WORK_ITEM` and `WORK_ITEM_LOOKUP` before sending
- One WORK_ITEM per PR — branch and scope match a single feature or design
- Shards describe current behavior; breaking or removed behavior is in the changeset, not feature/client guides

## See also

- [Why mdcp for coding agents](./why-mdcp-for-agents.md) — developer pain and which commands address it
- [Agent integration](./agent-integration.md) — npm scripts quick reference
- [spec/extensions/prompts-mdcp-defaults/0.4.0.0/](../../spec/extensions/prompts-mdcp-defaults/0.4.0.0/) — versioned copy-paste prompt files
- [Project layout](./project-layout.md) — shard directory structure
- [Cross-links and refs](./cross-links-and-refs.md) — slug lookup while authoring
- [Optional linters](./optional-linters.md) — markdownlint, Vale, link check peers
