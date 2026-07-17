# Helper Skills

Normative profile for **helper skills** that extend the parent MDCP Agent Skill and drive shard authoring across the three-tier guide layout. Parent spec: [MDCP 1.0 (draft)](./mdcp-1.0-spec.md).

## Purpose

Helper skills are part of the MDCP **authoring protocol** — not host-specific rules. They tell agents how to load a `WORK_ITEM`, which guides to write, and how to validate before merge. You can invoke them directly using their skill names (e.g. `/mdcp-feature-level`).

Reference copies live in the `skills/` directory (e.g., `skills/mdcp-feature-level/SKILL.md`). The canonical catalog is summarized below. **Do not edit** the `skills/` copies directly if you want changes to persist — propose upstream or add extensions.

## Required intake

Every helper skill **MUST** open with an **Intake (ask before editing)** section. The agent **MUST** ask the user for any missing required fields and **MUST** wait for answers before branching or editing shards. Skip a question only when the user already provided that value in the conversation. Do not invent values.

Required fields for work-item-driven helpers:

| Field              | Meaning                                                                                   | Example intake question                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `WORK_ITEM`        | Enough to resolve the task — tracker id, URL, or short issue name/description             | What issue, ticket URL, or task should this session cover?                                |
| `WORK_ITEM_LOOKUP` | Where to load scope and delivery conventions — shard path or plain location (e.g. GitHub) | Where should you load scope and delivery conventions? (Prefer a `docs/developer/` shard.) |

Bootstrap (`mdcp-getting-started`) **MUST** ask for `FEATURE`, `PERSONA`, and `EXPERIENCE` (novice vs expert onboarding depth) instead of `WORK_ITEM`.

Agents **MUST** load the issue (or equivalent) before editing shards or code. One `WORK_ITEM` per branch.

## Standard helper skills

| Helper Skill                                                               | Role                        | Primary guides                       |
| -------------------------------------------------------------------------- | --------------------------- | ------------------------------------ |
| [mdcp-getting-started](../../skills/mdcp-getting-started/SKILL.md)         | Bootstrap pipeline          | all tiers                            |
| [mdcp-feature-level](../../skills/mdcp-feature-level/SKILL.md)             | Feature engineering         | `features/`, `client/`, code + tests |
| [mdcp-doc-only](../../skills/mdcp-doc-only/SKILL.md)                       | Technical writing           | `features/`, `client/`, `developer/` |
| [mdcp-design-architecture](../../skills/mdcp-design-architecture/SKILL.md) | Architecture as MDCP shards | `features/protocol/`, `features/`    |
| [mdcp-ux](../../skills/mdcp-ux/SKILL.md)                                   | User-centric journeys       | `client/`, glossary                  |

Goals and hard boundaries for each helper (what it is / is not):

- [Getting-started helper](./skills/mdcp-getting-started.md)
- [Feature-level helper](./skills/mdcp-feature-level.md)
- [Doc-only helper](./skills/mdcp-doc-only.md)
- [Design-architecture helper](./skills/mdcp-design-architecture.md)
- [UX helper](./skills/mdcp-ux.md)

Index: [skills.md](../../docs/skills.md). Some helpers also have optional [live skill eval](../../developer/live-skill-evals.md) suites under `tests/skills/`.

## Three-tier authoring obligations

Place each shard by **audience and job**, not by topic keyword. The same subject (for example Agent Skills) can span tiers: product delivery in `features/`, consumer install in `client/`, maintainer evals in `developer/`.

| Guide             | Holds (put here)                                                                                    | Keep out                                                        | Helpers that write here                      |
| ----------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| `docs/features/`  | What the product does — capabilities, design/ADRs, contracts, acceptance criteria                   | Maintainer runbooks, CI/eval loops, contributor setup           | feature-level, doc-only, design-architecture |
| `docs/client/`    | How consumers use it — end-user value, install/config/usage for the shipped tool                    | Internal contributor process, skill-authoring, live eval suites | feature-level, doc-only, ux                  |
| `docs/developer/` | How to work on this repo — setup, layout, validation, releases, skill development, live skill evals | Product capability specs or consumer tutorials                  | doc-only, getting-started                    |

**Placement test:** If removing the shard would confuse a **consumer** of the tool, it is features or client. If only **contributors** to this monorepo need it, it is developer.

Shared terms: `docs/glossary/` — all helpers that introduce vocabulary.

## Feature-level workflow (normative summary)

When using [mdcp-feature-level](../../skills/mdcp-feature-level/SKILL.md)
(detail: [Feature-level helper](./skills/mdcp-feature-level.md)):

1. Complete intake (`WORK_ITEM`, `WORK_ITEM_LOOKUP`)
2. Branch from updated `main` for `WORK_ITEM`
3. Load issue via `WORK_ITEM_LOOKUP`
4. **Docs first** — update `features/` and `client/` shards; update each guide `index.md`
5. **TDD** — implement against documented acceptance criteria
6. **Validate** — `mdcp check` (and repo test commands)
7. **Wrap-up** — changeset for breaking/removed behavior (do not link durable shards/ADRs to `.changeset/*.md`); docs describe current behavior only

## Design-architecture workflow (normative summary)

When using [mdcp-design-architecture](../../skills/mdcp-design-architecture/SKILL.md)
(detail: [Design-architecture helper](./skills/mdcp-design-architecture.md)):

1. Complete intake (`WORK_ITEM`, `WORK_ITEM_LOOKUP`)
2. Branch from updated `main` for `WORK_ITEM`
3. Draft or split architecture intent under `docs/features/` (and ADRs under `docs/features/adr/` when appropriate); update indexes
4. Retire superseded design text from durable shards; leave product code and client guides to other helpers
5. **Validate** — `mdcp check` (and repo docs validation)
6. **Wrap-up** — link `WORK_ITEM`; defer implementation / UX polish explicitly when the ask was oversized

## Entrypoint chain

```text
/mdcp-feature-level → intake questions → shards → mdcp check
/mdcp-design-architecture → intake → feature/ADR shards → mdcp check
```

The helper skill collects `WORK_ITEM_LOOKUP` via intake for scope.
