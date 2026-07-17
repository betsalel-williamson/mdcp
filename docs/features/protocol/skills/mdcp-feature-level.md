# Feature-level helper

Product capability: the **`mdcp-feature-level`** helper skill implements and
documents shipped features using a **docs-first** then **TDD** loop so MDCP
shards stay the contract before product code changes.

Invoke (after the parent skill is installed):

```text
/mdcp-feature-level
```

Upstream pack: [`skills/mdcp-feature-level/`](../../../../skills/mdcp-feature-level/SKILL.md).
Shared helper contract (intake, guide placement): [Helper Skills](../agent-task-prompts.md).

## End-user value

Shipped capabilities are documented for consumers and contributors before code
lands. Acceptance criteria in shards stay aligned with as-built behavior instead
of drifting in chat-only designs.

## What this helper is for

| Obligation            | As-built expectation                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Work-item intake      | Ask for `WORK_ITEM` and `WORK_ITEM_LOOKUP` before branching or editing                                      |
| One focused branch    | Branch from updated `main` for a single issue; do not mix unrelated features                                |
| Place by audience     | User-facing work → `docs/features/` + `docs/client/`; maintainer-only → `docs/developer/` only              |
| Docs first            | Update guide shards and indexes before product code; put contracts in shards, not implementation dumps      |
| TDD when code changes | Write failing tests first where the repo uses tests, then implement, then refactor; skip TDD when docs-only |
| Current docs only     | Align shards to as-built behavior; no superseded-workflow archaeology in durable docs                       |
| Validate and wrap-up  | Run repo tests + `mdcp check`; changeset/release notes per repo conventions; link `WORK_ITEM`               |

Intake is the same as other work-item helpers: `WORK_ITEM` and
`WORK_ITEM_LOOKUP` before branching or editing.

## What this helper is not

- **Docs-only technical writing with no product code** — prefer
  [mdcp-doc-only](./mdcp-doc-only.md) when the ask is shards-only.
- **Architecture intent / ADR drafting without implementation** — use
  [mdcp-design-architecture](./mdcp-design-architecture.md).
- **Primary client-guide UX / UI flow work** — use [mdcp-ux](./mdcp-ux.md).
- **Bootstrapping MDCP in an empty or legacy repo** — use
  [mdcp-getting-started](./mdcp-getting-started.md).
- **Expanding beyond the loaded `WORK_ITEM`** — stay on acceptance criteria
  unless the issue explicitly expands scope.

When the user asks for design-only or docs-only work, this helper **SHOULD**
defer or narrow to the matching helper rather than inventing end-to-end delivery.

## Acceptance (as-built)

A successful feature-level session typically:

1. Updates the correct guide tiers for the audience (features+client or developer)
2. Implements against documented acceptance when product code changes (TDD where applicable)
3. Leaves durable shards describing current behavior only
4. Passes repo tests and docs validation
5. Links `WORK_ITEM` in review; adds a changeset when published package behavior changes

Optional local with/without-skill grading for this helper:
[mdcp-feature-level live evals](../../../../tests/skills/mdcp-feature-level/evals/README.md)
(maintainer workflow — not a CI gate). See [Live skill evals](../../../developer/live-skill-evals.md).
