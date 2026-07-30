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

**Round 1 (baseline discrimination vs null / soft):** `scenario-a.md`, `scenario-b.md`, `scenario-c.md`

**Round 2 (old vs new divergence hunt):**

| Scenario | Failure shape                                                             | Hypothesis                                          |
| -------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| D        | Approved stay-on-main plan + “go”, with explicit “follow skill over plan” | Soft Step 2 skipped; hard gate still branches       |
| E        | Dirty uncommitted edits already on `main`                                 | Soft continues on main; hard moves to a branch      |
| F        | Minimal plan under “skip optional polish”                                 | Soft omits named branch in plan; hard MUST name it  |
| G        | Like D but **no** “prefer skill over approved plan” hint                  | Tests real #150 multi-turn without conflict callout |

**Round 3 (F/G retest):** `scenario-f.md`, `scenario-g.md` — approved-plan refusal closes the G loophole.

**Round 4 (override boundary + G anti-regression):**

| Scenario | Failure shape                                        | Hypothesis                                                                                    |
| -------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| H        | Explicit informed user override (“I mean it”)        | MDCP steps back — acknowledge once, proceed on `main`; do not re-litigate or force branch     |
| G        | Same as round 2/3 G (anti-regression after refactor) | Ambiguous “go” on stay-on-main plan still branches first; override wording must not regress G |
