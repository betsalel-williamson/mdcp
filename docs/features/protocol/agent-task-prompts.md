# Agent task prompts (MDCP 1.0)

Normative profile for **copy-paste agent prompts** that drive shard authoring across the three-tier guide layout. Parent spec: [MDCP 1.0 (draft)](./mdcp-1.0-spec.md).

## Purpose

Prompts are part of the MDCP **authoring protocol** — not host-specific rules. They tell agents how to load a `WORK_ITEM`, which guides to write, and how to validate before merge.

Reference copies live in [spec/task-prompts/](../../spec/task-prompts/). The canonical prompt list is embedded in [spec/llms-index/](../../spec/llms-index/) llms-index artifacts and summarized below. `mdcp export --llms-index --fetch` caches prompts under `.caches/mdcp/prompts/` in the consumer docs root.

**Do not edit** fetched `mdcp.v*.llms.txt` for prompt or workflow changes — propose upstream or add [extensions](./extensions-and-archetypes.md) under `docs/extensions/`.

## Required prompt shape

Every task-type prompt **MUST** include a **Replace before sending** block:

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

| Field              | Meaning                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `WORK_ITEM`        | Tracker id or URL (e.g. GitHub issue number)                     |
| `WORK_ITEM_LOOKUP` | Shard path describing how to load scope and delivery conventions |

Agents **MUST** load the issue (or equivalent) before editing shards or code. One `WORK_ITEM` per branch.

## Standard prompts (protocol 0.4.0.0)

| Prompt file                                                                                        | Role                             | Primary guides                       |
| -------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------ |
| [getting-started-with-mdcp.prompt.md](../../spec/task-prompts/getting-started-with-mdcp.prompt.md) | Bootstrap pipeline               | all tiers                            |
| [feature-level-task.prompt.md](../../spec/task-prompts/feature-level-task.prompt.md)               | Feature engineering              | `features/`, `client/`, code + tests |
| [doc-only-task.prompt.md](../../spec/task-prompts/doc-only-task.prompt.md)                         | Technical writing                | `features/`, `client/`, `developer/` |
| [design-architecture-task.prompt.md](../../spec/task-prompts/design-architecture-task.prompt.md)   | ADRs, RFCs                       | `features/protocol/`, `features/`    |
| [ux-task.prompt.md](../../spec/task-prompts/ux-task.prompt.md)                                     | End-user experience              | `client/`                            |
| [review-task.prompt.md](../../spec/task-prompts/review-task.prompt.md)                             | Architecture and security review | `review/`, `features/` (stubs)       |

Index: [spec/task-prompts/README.md](../../spec/task-prompts/README.md). Cached in consumer repos at `.caches/mdcp/prompts/` after fetch.

## Three-tier authoring obligations

| Guide             | Holds                                                  | Prompts that write here                      |
| ----------------- | ------------------------------------------------------ | -------------------------------------------- |
| `docs/features/`  | Capabilities, design, API surface, acceptance criteria | feature-level, doc-only, design-architecture |
| `docs/client/`    | End-user value, how to use the feature                 | feature-level, doc-only, ux                  |
| `docs/developer/` | Repo workflow, tracker integration, releases           | doc-only, getting-started                    |

Shared terms: `docs/glossary/` — all prompts that introduce vocabulary.

## Feature-level workflow (normative summary)

When using [feature-level-task.prompt.md](../../spec/task-prompts/feature-level-task.prompt.md):

1. Branch from updated `main` for `WORK_ITEM`
2. Load issue via `WORK_ITEM_LOOKUP`
3. **Docs first** — update `features/` and `client/` shards; update each guide `index.md`
4. **TDD** — implement against documented acceptance criteria
5. **Validate** — `mdcp check` (and repo test commands)
6. **Wrap-up** — changeset for breaking/removed behavior; docs describe current behavior only

## Entrypoint chain

```text
mdcp.v0.4.llms.txt  →  .caches/mdcp/prompts/*.prompt.md (WORK_ITEM set)  →  shards  →  mdcp check
```

The llms-index file points agents at prompts and query commands; prompts point at `WORK_ITEM_LOOKUP` for scope.

## Review workflow (normative summary)

When using [review-task.prompt.md](../../spec/task-prompts/review-task.prompt.md):

1. Branch per `REVIEW_NODE` (one manifest node per PR)
2. Load `WORK_ITEM` via `WORK_ITEM_LOOKUP`
3. Run repo review commands from `docs/review/` playbook
4. Log **atomic findings** — one implementable unit per finding shard
5. Validate with review + `mdcp check`

Review prompts **MAY** add `REVIEW_NODE=` to the Replace block alongside `WORK_ITEM`.
