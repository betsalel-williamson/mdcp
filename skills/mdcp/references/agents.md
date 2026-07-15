# MDCP subagents

Task-type instructions shipped with the parent `mdcp` skill. They live under
`agents/` as **skill resources** (progressive disclosure). They are not separate
Agent Skills: hosts discover only directories that contain `SKILL.md`, so the
portable slash entrypoint is **`/mdcp`**. Do not invent `/mdcp:feature-level`-style
commands.

Upstream source: `skills/mdcp/agents/`. After install: `.agents/skills/mdcp/agents/`.

CLI commands (`compile`, `check`, …) are documented in
[`@bwilliamson/mdcp-cli`](https://www.npmjs.com/package/@bwilliamson/mdcp-cli) —
not here. This file covers skill subagent workflow only.

## How to call them

1. Activate the parent skill with `/mdcp` (hosts that support slash skills), or
   let the host auto-load from the skill description.
2. State the task in the same turn using plain language (or the subagent id).
   Example bootstrap:

   ```text
   /mdcp help me get started
   ```

   Other examples: `/mdcp feature-level`, `/mdcp doc-only` — or describe the work
   (`help me document this feature`) so the agent opens `agents/<id>.md`.

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

## Follow-up turns

Prefer activating `/mdcp` first so docs-as-code rules stay in context.

**Add documentation for a new feature:**

```markdown
Add shards for feature "{{FEATURE}}" under `docs/features/`, update `docs/developer/`
if maintainer workflows changed, and add an end-user section under `docs/client/`.
Update each guide's `index.md`, then run this repo's mdcp compile and check commands.
Discover shards with host search. Validate cross-links with `mdcp check`.
Do not edit generated compile output by hand.
```

**Fix validation failures:**

```markdown
Documentation check failed. Read the error output, fix only shard `.md` files and
config if needed, then re-run until check passes.
```

**Regenerate after TOC change:**

```markdown
I updated `index.md` in guide `{{GUIDE_NAME}}`. Run mdcp compile and check using
this repo's documented commands.
```

## Docs layout reminder

| Guide             | Holds                                     |
| ----------------- | ----------------------------------------- |
| `docs/features/`  | Capabilities, design, acceptance criteria |
| `docs/client/`    | End-user value and how to use the product |
| `docs/developer/` | Repo setup, layout, tests, releases       |

Details: parent `SKILL.md` “What belongs where”. Guide folders need `index.md`
(link order = compile order) and topic shards. Never hand-edit generated compile
output or `refs.json`.

## Review checklist (agent doc PRs)

- Only shard `.md` files and config changed
- `index.md` link order matches intended compile order
- Doc check passes locally and in CI
- Cross-links pass `mdcp check` (optional `mdcp refs list`)
- Subagents asked intake questions before editing
- One `WORK_ITEM` per PR; shards describe current behavior
