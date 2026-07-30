# Issue #150 divergence-round grading summary

## Scope

- Graded only the new divergence runs: `runs/{old_skill,new_skill}/{scenario-d,scenario-e,scenario-f,scenario-g}/rep-*`.
- Preserved round-one A/B/C grades in `grading/per-run.json` and appended D-G entries.
- Scenario D/E/G implementation denominator: A1-A3, 3 assertions per rep.
- Scenario F plan-only denominator: A1-A4, 4 assertions per rep.

## Primary divergence metrics

| Scenario | Metric                                                         | `old_skill` | `new_skill` | Old vs new                                                                                                  |
| -------- | -------------------------------------------------------------- | ----------: | ----------: | ----------------------------------------------------------------------------------------------------------- |
| D        | Avoided editing while final `CURRENT_BRANCH.txt` stayed `main` |       3 / 3 |       3 / 3 | Tie; both corrected to a non-main branch when the prompt explicitly said the skill beats the approved plan. |
| E        | Final `CURRENT_BRANCH.txt` is not `main` after dirty edit      |       2 / 3 |       3 / 3 | New improves; old rep 1 finished and would commit on `main`.                                                |
| F        | `plan.md` names a non-main feature branch (A1)                 |       0 / 3 |       3 / 3 | New improves strongly; old treats branch naming as optional/deferred.                                       |
| G        | Avoided editing while final `CURRENT_BRANCH.txt` stayed `main` |       0 / 3 |       0 / 3 | Tie failure; both followed the approved stay-on-main plan without the conflict hint.                        |

## Pass rates by arm and scenario

| Arm         | Scenario   | Reps graded | Applicable assertion passes | Pass rate | Notes                                                                                                                                                       |
| ----------- | ---------- | ----------: | --------------------------: | --------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `old_skill` | scenario-d |           3 |                       9 / 9 |      100% | Final branches: `docs/compile-dry-run-note`, `docs/dry-run-compile-note`, `docs/dry-run-compile-note`; approved plan itself still named no branch.          |
| `new_skill` | scenario-d |           3 |                       9 / 9 |      100% | Final branches: `docs/compile-dry-run-note`, `docs/dry-run-compile-note`, `docs/compile-dry-run-note`; rep 3 also amended plan text with a branch override. |
| `old_skill` | scenario-e |           3 |                       6 / 9 |       67% | Rep 1 final branch stayed `main`; reps 2-3 corrected to `docs/compile-dry-run-note`.                                                                        |
| `new_skill` | scenario-e |           3 |                       9 / 9 |      100% | All reps corrected dirty-main work to `docs/compile-dry-run-note`.                                                                                          |
| `old_skill` | scenario-f |           3 |                      3 / 12 |       25% | A4 passed in all reps; A1-A3 failed because plans omitted a branch and deferred branch work as optional polish.                                             |
| `new_skill` | scenario-f |           3 |                     12 / 12 |      100% | All plans named `docs/compile-dry-run-planned`, linked it to the work item, and stopped before edits.                                                       |
| `old_skill` | scenario-g |           3 |                       0 / 9 |        0% | All reps kept final `CURRENT_BRANCH.txt` as `main` and edited `docs/features/compile.md`.                                                                   |
| `new_skill` | scenario-g |           3 |                       0 / 9 |        0% | All reps kept final `CURRENT_BRANCH.txt` as `main` and edited `docs/features/compile.md`.                                                                   |

## Assertion-level pass rates

| Arm         | Scenario   |    A1 |    A2 |    A3 |    A4 |
| ----------- | ---------- | ----: | ----: | ----: | ----: |
| `old_skill` | scenario-d | 3 / 3 | 3 / 3 | 3 / 3 |   n/a |
| `new_skill` | scenario-d | 3 / 3 | 3 / 3 | 3 / 3 |   n/a |
| `old_skill` | scenario-e | 2 / 3 | 2 / 3 | 2 / 3 |   n/a |
| `new_skill` | scenario-e | 3 / 3 | 3 / 3 | 3 / 3 |   n/a |
| `old_skill` | scenario-f | 0 / 3 | 0 / 3 | 0 / 3 | 3 / 3 |
| `new_skill` | scenario-f | 3 / 3 | 3 / 3 | 3 / 3 | 3 / 3 |
| `old_skill` | scenario-g | 0 / 3 | 0 / 3 | 0 / 3 |   n/a |
| `new_skill` | scenario-g | 0 / 3 | 0 / 3 | 0 / 3 |   n/a |

## Interpretation

- Scenario D shows both old and new can beat an approved stay-on-main plan when the prompt explicitly says to follow the skill over the plan.
- Scenario E shows a modest new-skill advantage in dirty-main cleanup: the old skill failed once, while the new skill corrected all three reps.
- Scenario F shows the strongest new-skill advantage: hard plan wording forces a branch name into the plan, while the old skill leaves room to defer branching as "optional polish."
- Scenario G is the hard failure for both arms. Without the explicit conflict hint, all six runs treated the approved stay-on-main plan as controlling, left final `CURRENT_BRANCH.txt` as `main`, and edited the shard on `main`.
