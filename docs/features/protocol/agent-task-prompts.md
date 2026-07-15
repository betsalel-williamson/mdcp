# Agent task subagents (MDCP 1.0)

Normative profile for **task-type subagents** under the parent MDCP Agent Skill that drive shard authoring across the three-tier guide layout. Parent spec: [MDCP 1.0 (draft)](./mdcp-1.0-spec.md).

## Purpose

Subagent files are part of the MDCP **authoring protocol** — not host-specific rules. They tell agents how to load a `WORK_ITEM`, which guides to write, and how to validate before merge. Activate the parent skill (`/mdcp`), then name a subagent id and read `agents/<id>.md`. Invoke recipe: [skills/mdcp/references/agents.md](../../skills/mdcp/references/agents.md). Consumer index: [LLM collaboration](../../client-cli/llm-collaboration.md).

Reference copies live in [skills/mdcp/agents/](../../skills/mdcp/agents/). The canonical catalog is summarized below. **Do not edit** the `skills/mdcp/agents/` copies directly if you want changes to persist — propose upstream or add extensions.

## Required replace block

Every task-type subagent **MUST** include a **Replace before sending** block:

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

| Field              | Meaning                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `WORK_ITEM`        | Tracker id or URL (e.g. GitHub issue number)                     |
| `WORK_ITEM_LOOKUP` | Shard path describing how to load scope and delivery conventions |

Agents **MUST** load the issue (or equivalent) before editing shards or code. One `WORK_ITEM` per branch.

## Standard subagents (protocol 0.4.0.0)

| Subagent                                                                  | Role                             | Primary guides                       |
| ------------------------------------------------------------------------- | -------------------------------- | ------------------------------------ |
| [getting-started.md](../../skills/mdcp/agents/getting-started.md)         | Bootstrap pipeline               | all tiers                            |
| [feature-level.md](../../skills/mdcp/agents/feature-level.md)             | Feature engineering              | `features/`, `client/`, code + tests |
| [doc-only.md](../../skills/mdcp/agents/doc-only.md)                       | Technical writing                | `features/`, `client/`, `developer/` |
| [design-architecture.md](../../skills/mdcp/agents/design-architecture.md) | ADRs, RFCs                       | `features/protocol/`, `features/`    |
| [ux.md](../../skills/mdcp/agents/ux.md)                                   | End-user experience              | `client/`                            |
| [review.md](../../skills/mdcp/agents/review.md)                           | Architecture and security review | `review/`, `features/` (stubs)       |

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

1. Branch from updated `main` for `WORK_ITEM`
2. Load issue via `WORK_ITEM_LOOKUP`
3. **Docs first** — update `features/` and `client/` shards; update each guide `index.md`
4. **TDD** — implement against documented acceptance criteria
5. **Validate** — `mdcp check` (and repo test commands)
6. **Wrap-up** — changeset for breaking/removed behavior; docs describe current behavior only

## Entrypoint chain

```text
/mdcp → agents/getting-started.md  →  agents/<id>.md (WORK_ITEM set)  →  shards  →  mdcp check
```

The parent Agent Skill points agents at subagents; subagents point at `WORK_ITEM_LOOKUP` for scope.

## Review workflow (normative summary)

When using [review.md](../../skills/mdcp/agents/review.md):

1. Branch per `REVIEW_NODE` (one manifest node per PR)
2. Load `WORK_ITEM` via `WORK_ITEM_LOOKUP`
3. Run repo review commands from `docs/review/` playbook
4. Log **atomic findings** — one implementable unit per finding shard
5. Validate with review + `mdcp check`

Review subagents **MAY** add `REVIEW_NODE=` to the Replace block alongside `WORK_ITEM`.
