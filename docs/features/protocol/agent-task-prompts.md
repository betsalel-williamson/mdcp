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

| Helper Skill                                                               | Role                | Primary guides                       |
| -------------------------------------------------------------------------- | ------------------- | ------------------------------------ |
| [mdcp-getting-started](../../skills/mdcp-getting-started/SKILL.md)         | Bootstrap pipeline  | all tiers                            |
| [mdcp-feature-level](../../skills/mdcp-feature-level/SKILL.md)             | Feature engineering | `features/`, `client/`, code + tests |
| [mdcp-doc-only](../../skills/mdcp-doc-only/SKILL.md)                       | Technical writing   | `features/`, `client/`, `developer/` |
| [mdcp-design-architecture](../../skills/mdcp-design-architecture/SKILL.md) | ADRs, RFCs          | `features/protocol/`, `features/`    |
| [mdcp-ux](../../skills/mdcp-ux/SKILL.md)                                   | End-user experience | `client/`                            |

Index: [skills.md](../../docs/skills.md). Some helpers also have optional [live skill eval](../live-skill-evals.md) suites under `tests/skills/`.

## Three-tier authoring obligations

| Guide             | Holds                                                  | Helpers that write here                      |
| ----------------- | ------------------------------------------------------ | -------------------------------------------- |
| `docs/features/`  | Capabilities, design, API surface, acceptance criteria | feature-level, doc-only, design-architecture |
| `docs/client/`    | End-user value, how to use the feature                 | feature-level, doc-only, ux                  |
| `docs/developer/` | Repo workflow, tracker integration, releases           | doc-only, getting-started                    |

Shared terms: `docs/glossary/` — all helpers that introduce vocabulary.

## Feature-level workflow (normative summary)

When using [mdcp-feature-level](../../skills/mdcp-feature-level/SKILL.md):

1. Complete intake (`WORK_ITEM`, `WORK_ITEM_LOOKUP`)
2. Branch from updated `main` for `WORK_ITEM`
3. Load issue via `WORK_ITEM_LOOKUP`
4. **Docs first** — update `features/` and `client/` shards; update each guide `index.md`
5. **TDD** — implement against documented acceptance criteria
6. **Validate** — `mdcp check` (and repo test commands)
7. **Wrap-up** — changeset for breaking/removed behavior (do not link durable shards/ADRs to `.changeset/*.md`); docs describe current behavior only

## Entrypoint chain

```text
/mdcp-feature-level → intake questions → shards → mdcp check
```

The helper skill collects `WORK_ITEM_LOOKUP` via intake for scope.
