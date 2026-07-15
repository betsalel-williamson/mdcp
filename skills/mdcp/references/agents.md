# MDCP subagents

Task-type instructions shipped with the parent `mdcp` skill. They live under
`agents/` as **skill resources** (progressive disclosure). They are not separate
Agent Skills: hosts discover only directories that contain `SKILL.md`, so the
portable slash entrypoint is **`/mdcp`**. Do not invent `/mdcp:feature-level`-style
commands.

Upstream source: `skills/mdcp/agents/`. After install: `.agents/skills/mdcp/agents/`.

## How to call them

1. Activate the parent skill: `/mdcp` (hosts that support slash skills), or let
   the host auto-load from the skill description.
2. Name the **subagent id** in the same turn (for example `feature-level`).
3. Read and follow `agents/<id>.md` relative to this skill directory (after
   install: `.agents/skills/mdcp/agents/<id>.md`).
4. Answer the subagent’s **intake questions** in chat for any missing values
   (`WORK_ITEM`, `FEATURE` / `PERSONA`). The agent must ask before
   editing; do not require a pre-filled template.

**Fallback:** attach or open the same path on hosts without slash skills.

**Optional:** hosts that can fork work may spawn an isolated agent with that
markdown as the task prompt.

## Catalog

| Id                    | When to use                       | File                            |
| --------------------- | --------------------------------- | ------------------------------- |
| `getting-started`     | Bootstrap MDCP in a repository    | `agents/getting-started.md`     |
| `doc-only`            | Documentation-only work           | `agents/doc-only.md`            |
| `design-architecture` | RFCs, ADRs, data models           | `agents/design-architecture.md` |
| `feature-level`       | Feature work, docs-first then TDD | `agents/feature-level.md`       |
| `ux`                  | UI flows and client-guide updates | `agents/ux.md`                  |

Consumer index: see MDCP’s client-cli LLM collaboration guide after docs
compile, or the upstream shard `docs/client-cli/llm-collaboration.md`.
