# MDCP 1.0 specification (draft)

Normative specification for the MarkDown Context Protocol. Parent: [GitHub #48](https://github.com/betsalel-williamson/mdcp/issues/48).

> **Status:** Draft — reference implementation leads; prose reconciled against `mdcp-core` before 1.0 final.

## 1. Introduction

MDCP standardizes **offline document context preparation**: shard layout, compile semantics, validation pipeline, and export profiles. It does **not** standardize wire transport (see [Scope and positioning](./01-scope-and-positioning.md)).

Conformance keywords: **MUST**, **SHOULD**, **MAY** (RFC 2119 sense).

## 2. Protocol version

Conforming `mdcp.config.json` **MUST** declare `protocolVersion` as a four-part string (default `1.0.0.0`).

## 3. Guide layout and three-tier authoring

Conforming repositories **SHOULD** organize shards into guides listed in `compileOrder`:

| Guide tier | Typical path | Holds                                        |
| ---------- | ------------ | -------------------------------------------- |
| Features   | `features/`  | Capabilities, design, acceptance criteria    |
| Client     | `client/`    | End-user value and usage                     |
| Developer  | `developer/` | Repo workflow, tracker integration, releases |
| Glossary   | `glossary/`  | Shared terms and disambiguation              |

Each guide **MUST** have a manifest (`index.md` or `shards.md`) defining compile order.

## 4. Agent task prompts

Copy-paste prompts in `examples/prompts/` are part of the MDCP 1.0 authoring profile. See [Agent task prompts](./agent-task-prompts.md).

Task-type prompts **MUST** include `WORK_ITEM` and `WORK_ITEM_LOOKUP`. Feature work **SHOULD** use [feature-level-task.prompt.md](../../examples/prompts/feature-level-task.prompt.md). Review work **SHOULD** use [review-task.prompt.md](../../examples/prompts/review-task.prompt.md) with `REVIEW_NODE` set.

## 9. Export profiles

### 9.1 LLM export (`export.llm`)

Token-stripped compiled output for agents. Implemented by `mdcp export --llm`.

### 9.2 llms-index export (`export.llmsIndex`)

Versioned agent bootstrap file in the docs root.

| Rule        | Requirement                                                                    |
| ----------- | ------------------------------------------------------------------------------ |
| First line  | `mdcp-llms-index: {four-part version}`                                         |
| Filename    | `mdcp.v{version}.llms.txt` — trailing `.0` segments **MAY** be omitted         |
| Equivalence | `mdcp.v1.llms.txt` and `mdcp.v1.0.0.0.llms.txt` both denote protocol `1.0.0.0` |
| Content     | Index only; **MUST NOT** embed full guide bodies                               |
| Command     | `mdcp export --llms-index`                                                     |

Schema: [spec/schemas/mdcp-llms-index-1.0.0.0.schema.json](../../../spec/schemas/mdcp-llms-index-1.0.0.0.schema.json)

## Appendix A (informative)

MDCP vs MCP and delivery adapters: [01-scope-and-positioning.md](./01-scope-and-positioning.md)
