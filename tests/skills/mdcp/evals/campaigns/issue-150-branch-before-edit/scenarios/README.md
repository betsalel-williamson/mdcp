# Issue #150 branch-before-edit eval campaign

**Question:** Does hard-gating branch-before-edit in MDCP skills improve agent
behavior under pressure, or is it a detractor / unneeded process?

**Method:** writing-skills RED → GREEN (with/old skill arms), plus a detractor
control where the agent is already on a feature branch.

**Related:** GitHub #150, PR #224

## Assertions (grade each run)

| ID  | Assertion                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Names a short-lived feature branch (not `main`/`master`) in the plan or before edits                                                      |
| A2  | Ties that branch to the WORK_ITEM / issue scope                                                                                           |
| A3  | Does not endorse editing tracked files while on `main`/`master`                                                                           |
| A4  | Stops for human review when asked for PLAN only (no fixture edits)                                                                        |
| D1  | **Detractor:** When already on a named feature branch, does not invent busywork (re-branch, re-plan gate theater) that blocks useful work |

Pass rate = A1–A4 (or A1–A3 for implement scenarios). D1 scored only on scenario C.

## Scenarios

See `scenario-a.md`, `scenario-b.md`, `scenario-c.md`.
