# MDCP 1.0 specification (draft)

Normative specification for the MarkDown Context Protocol. Parent: [GitHub #48](https://github.com/betsalel-williamson/mdcp/issues/48).

> **Status:** Draft — reference implementation leads; prose reconciled against `mdcp-core` before npm **1.0.0**. npm **0.4.x** (open alpha) implements this draft. Agent entrypoint is the parent **Agent Skill** (`/mdcp`).

## 1. Introduction

MDCP defines **offline document context preparation**: shard layout, compile semantics, validation pipeline, and Agent Skill delivery. It does **not** define wire transport (see [Scope and positioning](./01-scope-and-positioning.md)).

Conformance keywords: **MUST**, **SHOULD**, **MAY** (RFC 2119 sense).

## 2. Protocol version

Conforming `mdcp.config.json` **MUST** declare `protocolVersion` as a four-part string (default `0.4.0.0`).

Published protocol profiles start at **0.4.0.0**. Pre-0.4 tooling and doc-style evolution is recorded in [package changelogs](https://github.com/betsalel-williamson/mdcp/blob/main/packages/mdcp-cli/CHANGELOG.md). Agent delivery uses [Agent Skills](../../glossary/agent-skills.md).

## 3. Guide layout and three-tier authoring

Conforming repositories **SHOULD** organize shards into guides listed in `compileOrder`:

| Guide tier | Typical path | Holds                                        |
| ---------- | ------------ | -------------------------------------------- |
| Features   | `features/`  | Capabilities, design, acceptance criteria    |
| Client     | `client/`    | End-user value and usage                     |
| Developer  | `developer/` | Repo workflow, tracker integration, releases |
| Glossary   | `glossary/`  | Shared terms and disambiguation              |

Each guide **MUST** have a manifest (`index.md` or `shards.md`) defining compile order.

Glossary terms **SHOULD** be one shard per entry. Large glossaries **MAY** split manifests across `index.md` and sub-index files (for example `index-protocol.md`) that link term shards; transitive manifest links include terms in compile output.

## 4. Agent task subagents

Helper skills are part of the MDCP 1.0 authoring profile. Activate via the skill trigger (e.g. `/mdcp-feature-level`). See [Agent helper skills](./agent-task-prompts.md).

Helper skills **MUST** collect `WORK_ITEM` and `WORK_ITEM_LOOKUP` via interactive intake before editing. Feature work **SHOULD** use [mdcp-feature-level](../../skills/mdcp-feature-level/SKILL.md).

## 5. Skills and immutability

The Agent Skills pack in a consumer docs root **MUST NOT** be hand-edited by agents for repo-specific content. Project overlays belong in `docs/extensions/` or normative shards. Extension packs and archetypes: [Extensions and archetypes](./extensions-and-archetypes.md).

## 9. Agent context delivery

Agent context comes from the parent **Agent Skill** and one-shard reads. There is no token-strip export profile — see [ADR 0001](../adr/0001-remove-export-profiles.md).

## Appendix A (informative)

MDCP vs MCP and delivery adapters: [01-scope-and-positioning.md](./01-scope-and-positioning.md)
