# Doc-only helper

Product capability: the **`mdcp-doc-only`** helper skill authors or refactors
MDCP shards as a technical-writer pass — durable guide content without changing
functional product code.

Invoke (after the parent skill is installed):

```text
/mdcp-doc-only
```

Upstream pack: [`skills/mdcp-doc-only/`](../../../../skills/mdcp-doc-only/SKILL.md).
Shared helper contract (intake, guide placement): [Helper Skills](../agent-task-prompts.md).

## End-user value

Readers and agents get accurate, current shards (intent, contracts, acceptance)
without waiting on a code change. Stale workflows and planning backlogs leave
durable docs so search stays trustworthy.

## What this helper is for

| Obligation             | As-built expectation                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Work-item intake       | Ask for `WORK_ITEM` and `WORK_ITEM_LOOKUP` before branching or editing                                  |
| Docs-only branch       | One documentation scope per branch; revise `docs/features/`, `docs/client/`, and/or `docs/developer/`   |
| Contracts not samples  | Put intent, contracts, and acceptance in shards — not implementation dumps or product source paths      |
| Indexes and validation | Update guide `index.md` files; run `mdcp check` (do not hand-edit compile output or `refs.json`)        |
| Current docs only      | Remove superseded workflows, planning backlogs, and pending `.changeset/*.md` links from durable shards |
| Hard scope boundary    | No `src/` edits, unit tests, or “just fix the code too” — defer code work to feature-level              |

Intake is the same as other work-item helpers: `WORK_ITEM` and
`WORK_ITEM_LOOKUP` before branching or editing.

## What this helper is not

- **Implementing CLI flags, packages, or unit tests** — use
  [mdcp-feature-level](./mdcp-feature-level.md).
- **Architecture intent / ADR drafting as the primary deliverable** — use
  [mdcp-design-architecture](./mdcp-design-architecture.md).
- **Primary client-guide UX / UI implementation** — use [mdcp-ux](./mdcp-ux.md).
- **Bootstrapping MDCP in an empty or legacy repo** — use
  [mdcp-getting-started](./mdcp-getting-started.md).
- **Keeping “old way” sections for archaeology** — Git history preserves prior
  wording; consumer notice of removed behavior belongs in the changeset pipeline.

When the user also asks for bug fixes or implementation in the same session,
this helper **MUST** refuse or defer that work to a separate `WORK_ITEM` under
feature-level.

## Acceptance (as-built)

A successful doc-only session typically:

1. Creates or updates focused Markdown under the appropriate guides
2. Updates guide indexes so shards are discoverable
3. Leaves `packages/` / product `src/` unchanged
4. Describes current product behavior only
5. Passes repo docs validation (`mdcp check` / docs scripts)

Optional local with/without-skill grading for this helper:
[mdcp-doc-only live evals](../../../../tests/skills/mdcp-doc-only/evals/README.md)
(maintainer workflow — not a CI gate). See [Live skill evals](../../../developer/live-skill-evals.md).
