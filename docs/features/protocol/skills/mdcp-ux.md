# UX helper

Product capability: the **`mdcp-ux`** helper skill maps ideal user flows in
**client-guide shards** and implements UI with the repository’s existing
patterns so end-user experience stays documented and as-built aligned.

Invoke (after the parent skill is installed):

```text
/mdcp-ux
```

Upstream pack: [`skills/mdcp-ux/`](../../../../skills/mdcp-ux/SKILL.md).
Shared helper contract (intake, guide placement): [Helper Skills](../agent-task-prompts.md).

## End-user value

Consumers get clearer flows and a more usable interface. Client-guide shards
describe how to use the product as it works now, not a superseded UI draft.

## What this helper is for

| Obligation                   | As-built expectation                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| Work-item intake             | Ask for `WORK_ITEM` and `WORK_ITEM_LOOKUP` before branching or editing                     |
| One UX scope                 | Branch from updated `main` for a single UX issue; do not mix unrelated UX work             |
| Client docs first            | Map ideal user flows under `docs/client/` before or alongside UI changes                   |
| Implement with repo patterns | Build UI and tests using this repository’s existing approach                               |
| Align as-built docs          | Update client-guide shards to match the shipped interface; remove superseded UI references |
| Validate and wrap-up         | Run repo tests + docs validation; release notes per repo conventions; link `WORK_ITEM`     |

Intake is the same as other work-item helpers: `WORK_ITEM` and
`WORK_ITEM_LOOKUP` before branching or editing.

## What this helper is not

- **Feature engineering across features + client + product code as the primary frame** —
  use [mdcp-feature-level](./mdcp-feature-level.md) when the ask is a full
  shipped capability, not UX-led client polish.
- **Docs-only cleanup with no UX/UI change** — use [mdcp-doc-only](./mdcp-doc-only.md).
- **Architecture intent / ADR drafting** — use
  [mdcp-design-architecture](./mdcp-design-architecture.md).
- **Bootstrapping MDCP in an empty or legacy repo** — use
  [mdcp-getting-started](./mdcp-getting-started.md).
- **Expanding beyond the loaded `WORK_ITEM`** — stay on the UX acceptance
  criteria unless the issue explicitly expands scope.

When the user asks for end-to-end delivery (architecture + feature code + UX)
in one session, this helper **MUST** stay on client flows and UI (or ask to
narrow scope) and state next steps for the other helpers.

## Acceptance (as-built)

A successful UX session typically:

1. Creates or updates focused shards under `docs/client/`
2. Implements UI against those flows using repo patterns (when code is in scope)
3. Leaves client docs describing the as-built interface only
4. Passes repo tests and docs validation
5. Links `WORK_ITEM` in review

This helper does not yet ship a dedicated live-eval suite under `tests/skills/`.
See [Live skill evals](../../../developer/live-skill-evals.md) for maintainer
eval conventions.
