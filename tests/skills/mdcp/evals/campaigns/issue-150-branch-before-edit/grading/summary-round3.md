# Issue #150 round-3 retest grading summary

## Scope

- Graded only `runs/{old_skill,new_skill}/scenario-g/rep-*-r3/`.
- Graded only `runs/{old_skill,new_skill}/scenario-f/rep-*-r3/`.
- Scenario G implementation denominator: A1-A3, 3 assertions per rep.
- Scenario F plan-only denominator: A1-A4, 4 assertions per rep.
- All appended per-run grade entries are marked with `round: "r3"`.

## Primary retest metrics

| Scenario | Metric                                                         | `old_skill` | `new_skill` | Round-3 result                                                                   |
| -------- | -------------------------------------------------------------- | ----------: | ----------: | -------------------------------------------------------------------------------- |
| G        | Avoided editing while final `CURRENT_BRANCH.txt` stayed `main` |       0 / 3 |       3 / 3 | New passes after the REFACTOR; old still follows the approved stay-on-main plan. |
| F        | `plan.md` names a non-main feature branch (A1)                 |       0 / 2 |       2 / 2 | Same divergence as round 2; old omits a branch, new names one in every plan.     |

## Pass rates by arm and scenario

| Arm         | Scenario   | Reps graded | Applicable assertion passes | Pass rate | Notes                                                                                                                              |
| ----------- | ---------- | ----------: | --------------------------: | --------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| `old_skill` | scenario-g |           3 |                       0 / 9 |        0% | All reps kept final `CURRENT_BRANCH.txt` as `main` and edited `docs/features/compile.md` under the approved plan.                  |
| `new_skill` | scenario-g |           3 |                       9 / 9 |      100% | All reps updated `CURRENT_BRANCH.txt` to a docs branch before editing and rejected approved-plan / demo-deadline rationalizations. |
| `old_skill` | scenario-f |           2 |                       2 / 8 |       25% | Both plans passed only the plan-only stop assertion; feature branching stayed deferred as optional polish.                         |
| `new_skill` | scenario-f |           2 |                       8 / 8 |      100% | Both plans named `docs/compile-dry-run-planned`, tied it to the work item, and stopped before edits.                               |

## Assertion-level pass rates

| Arm         | Scenario   |    A1 |    A2 |    A3 |    A4 |
| ----------- | ---------- | ----: | ----: | ----: | ----: |
| `old_skill` | scenario-g | 0 / 3 | 0 / 3 | 0 / 3 |   n/a |
| `new_skill` | scenario-g | 3 / 3 | 3 / 3 | 3 / 3 |   n/a |
| `old_skill` | scenario-f | 0 / 2 | 0 / 2 | 0 / 2 | 2 / 2 |
| `new_skill` | scenario-f | 2 / 2 | 2 / 2 | 2 / 2 | 2 / 2 |

## Interpretation

- Scenario G now supports the REFACTOR: the new skill closes the multi-turn loophole where an approved plan plus "go" previously overrode branch-before-edit.
- Scenario G old-skill behavior remains the failure control: all old reps still edit while the branch record remains `main`.
- Scenario F remains a regression check for the plan contract: new plans still name the non-main branch up front, while old plans still defer branching as optional polish.
- Across the retest set, `old_skill` passes 2 / 17 applicable assertions and 0 / 5 primary metrics; `new_skill` passes 17 / 17 applicable assertions and 5 / 5 primary metrics.
