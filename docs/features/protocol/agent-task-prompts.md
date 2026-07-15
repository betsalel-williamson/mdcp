# Agent task subagents (MDCP 1.0)

Normative profile for **task-type subagents** under the parent MDCP Agent Skill that drive shard authoring across the three-tier guide layout. Parent spec: [MDCP 1.0 (draft)](./mdcp-1.0-spec.md).

## Purpose

Subagent files are part of the MDCP **authoring protocol** — not host-specific rules. They tell agents how to load a `WORK_ITEM`, which guides to write, and how to validate before merge. Activate the parent skill (`/mdcp`), then name a subagent id and read `agents/<id>.md`. Invoke recipe and consumer index: [skills/mdcp/references/agents.md](../../skills/mdcp/references/agents.md).

Reference copies live in [skills/mdcp/agents/](../../skills/mdcp/agents/). The canonical catalog is summarized below. **Do not edit** the `skills/mdcp/agents/` copies directly if you want changes to persist — propose upstream or add extensions.

## Required intake

Every task-type subagent **MUST** open with an **Intake (ask before editing)** section. The agent **MUST** ask the user for any missing required fields and **MUST** wait for answers before branching or editing shards. Skip a question only when the user already provided that value in the conversation. Do not invent values.

Required fields for work-item-driven subagents:

| Field              | Meaning                                                          | Example intake question                                                                   |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `WORK_ITEM`        | Tracker id or URL (e.g. GitHub issue number)                     | What issue, ticket URL, or task should this session cover?                                |
| `WORK_ITEM_LOOKUP` | Shard path describing how to load scope and delivery conventions | Where should you load scope and delivery conventions? (Prefer a `docs/developer/` shard.) |

Bootstrap (`getting-started`) **MUST** ask for `FEATURE` and `PERSONA` instead of `WORK_ITEM`.

Agents **MUST** load the issue (or equivalent) before editing shards or code. One `WORK_ITEM` per branch.

## Standard subagents (protocol 0.4.0.0)

| Subagent                                                                  | Role                | Primary guides                       |
| ------------------------------------------------------------------------- | ------------------- | ------------------------------------ |
| [getting-started.md](../../skills/mdcp/agents/getting-started.md)         | Bootstrap pipeline  | all tiers                            |
| [feature-level.md](../../skills/mdcp/agents/feature-level.md)             | Feature engineering | `features/`, `client/`, code + tests |
| [doc-only.md](../../skills/mdcp/agents/doc-only.md)                       | Technical writing   | `features/`, `client/`, `developer/` |
| [design-architecture.md](../../skills/mdcp/agents/design-architecture.md) | ADRs, RFCs          | `features/protocol/`, `features/`    |
| [ux.md](../../skills/mdcp/agents/ux.md)                                   | End-user experience | `client/`                            |

Index: [skills/mdcp/agents/](../../skills/mdcp/agents/).

## Three-tier authoring obligations

| Guide             | Holds                                                  | Subagents that write here                    |
| ----------------- | ------------------------------------------------------ | -------------------------------------------- |
| `docs/features/`  | Capabilities, design, API surface, acceptance criteria | feature-level, doc-only, design-architecture |
| `docs/client/`    | End-user value, how to use the feature                 | feature-level, doc-only, ux                  |
| `docs/developer/` | Repo workflow, tracker integration, releases           | doc-only, getting-started                    |

Shared terms: `docs/glossary/` — all subagents that introduce vocabulary.

## Feature-level workflow (normative summary)

When using [feature-level.md](../../skills/mdcp/agents/feature-level.md):

1. Complete intake (`WORK_ITEM`, `WORK_ITEM_LOOKUP`)
2. Branch from updated `main` for `WORK_ITEM`
3. Load issue via `WORK_ITEM_LOOKUP`
4. **Docs first** — update `features/` and `client/` shards; update each guide `index.md`
5. **TDD** — implement against documented acceptance criteria
6. **Validate** — `mdcp check` (and repo test commands)
7. **Wrap-up** — changeset for breaking/removed behavior; docs describe current behavior only

## Entrypoint chain

```text
/mdcp → agents/<id>.md → intake questions → shards → mdcp check
```

The parent Agent Skill points agents at subagents; subagents collect `WORK_ITEM_LOOKUP` via intake for scope.
