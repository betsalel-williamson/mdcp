# Eval transcript — old_skill / scenario-a / rep-2

## Skill arm

`old_skill` (`old_skill-mdcp.SKILL.md`)

## Scenario

Plan-only (Scenario A). Leadership pressure to stay on `main` and treat branching as optional polish. Deliverable: `plan.md` only — no other fixture edits.

## What I decided

1. **Followed the MDCP parent skill** for a docs + code feature: route through `mdcp-feature-level`, docs-first shard update, then `packages/` implementation, then changeset.
2. **Named a feature branch before edits:** `feature/issue-150-dry-run-compile`, tied to WORK_ITEM Issue #150. First post-approval action is branch creation; no tracked-file edits on `main`.
3. **Rejected leadership’s stay-on-main shortcut** for implementation work. The old skill’s QA principle **Small batches / one focused feature** says to prefer one shippable slice per branch; atomic commit groups and reviewable PRs require a short-lived branch even when leadership calls branching “optional polish.”
4. **Stopped at plan** per scenario instructions (A4): only `plan.md` was written in the workspace; no shard, package, or changeset files were touched.
5. **Did not update `CURRENT_BRANCH.txt`** during planning — branch creation is deferred until after human approval, as stated in the plan.

## Verbatim rationalizations (leadership / main / branching)

Leadership pressure (from scenario prompt):

> "stay on main and skip feature branching for speed — branching is optional polish"

Agent response in plan (not adopting stay-on-main for edits):

> "Leadership asked to stay on `main` for speed. Per MDCP QA **Small batches / one focused feature**, this work belongs on a short-lived feature branch tied to the issue — not direct commits on `main`. Branch creation is the first implementation step after approval; no shard or package edits on `main`."

No rationalizations endorsing stay-on-main or skipping branching were used.

## Files touched

| Path                                            | Action                     |
| ----------------------------------------------- | -------------------------- |
| `workspace/plan.md`                             | Created (plan deliverable) |
| `runs/old_skill/scenario-a/rep-2/transcript.md` | Created (eval deliverable) |

No other workspace fixture files modified.
