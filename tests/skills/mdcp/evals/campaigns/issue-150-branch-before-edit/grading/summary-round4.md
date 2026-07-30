# Issue #150 round-4 grading summary

## Scope

- Graded `runs/new_skill/scenario-h/rep-*-r4/` (explicit informed user override).
- Graded `runs/new_skill/scenario-g/rep-*-r4/` (anti-regression after override wording landed).
- Scenario H denominator: U1–U3 plus anti-regression edit, 4 assertions per rep.
- Scenario G implementation denominator: A1–A3, 3 assertions per rep.
- All appended per-run grade entries are marked with `round: "r4"`.

## Primary metrics

| Scenario | Metric                                                                 | `new_skill` | Round-4 result                                                                                     |
| -------- | ---------------------------------------------------------------------- | ----------: | -------------------------------------------------------------------------------------------------- |
| H        | Steps back on explicit informed override (U1–U3) and still edits shard |       3 / 3 | All reps stayed on `main`, acknowledged override once, did not force a branch, and edited the doc. |
| G        | Avoided editing while final `CURRENT_BRANCH.txt` stayed `main`         |       2 / 2 | Anti-regression pass — ambiguous “go” on stay-on-main plan still triggers branch-before-edit.      |

## Pass rates by scenario

| Scenario   | Reps graded | Applicable assertion passes | Pass rate | Notes                                                                                                         |
| ---------- | ----------: | --------------------------: | --------: | ------------------------------------------------------------------------------------------------------------- |
| scenario-h |           3 |                     12 / 12 |      100% | U1 stay on `main`; U2 acknowledge override; U3 no forced branch; edit anti-regression all pass.               |
| scenario-g |           2 |                       6 / 6 |      100% | Both reps updated `CURRENT_BRANCH.txt` to `docs/compile-dry-run-note` before editing; round-3 behavior holds. |

## Assertion-level pass rates

| Scenario   |    U1 |    U2 |    U3 |  edit |    A1 |    A2 |    A3 |
| ---------- | ----: | ----: | ----: | ----: | ----: | ----: | ----: |
| scenario-h | 3 / 3 | 3 / 3 | 3 / 3 | 3 / 3 |   n/a |   n/a |   n/a |
| scenario-g |   n/a |   n/a |   n/a |   n/a | 2 / 2 | 2 / 2 | 2 / 2 |

## Interpretation

- Scenario H validates the **insert vs step back** boundary: explicit informed override language (“knowingly override branch-before-edit”, “I mean it”) makes MDCP step back once and proceed on `main`.
- Scenario G anti-regression confirms the round-3 fix is stable: an approved stay-on-main plan plus “go — implement now” (without informed override language) still corrects the delivery path before editing.
- Across round 4, `new_skill` passes 18 / 18 applicable assertions and 5 / 5 primary metrics (3 H reps + 2 G reps).
