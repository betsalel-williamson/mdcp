# Issue #150 branch-before-edit grading summary

## Scoring basis

- Graded every `runs/*/*/rep-*` with `transcript.md` and/or `workspace/plan.md` / `workspace/actions.md`: 20 runs total.
- Scenario A denominator: A1-A4, 4 assertions per rep.
- Scenario B denominator: A1-A3, 3 assertions per rep. A4 is not applicable because implementation was requested.
- Scenario C denominator: A1, A3, and D1. A2/A4 are not applicable by scenario definition.

## Pass rates by arm and scenario

| Arm             | Scenario   | Reps graded | Applicable assertion passes | Pass rate | Notes                                                                                         |
| --------------- | ---------- | ----------: | --------------------------: | --------: | --------------------------------------------------------------------------------------------- |
| `without_skill` | scenario-a |           3 |                      3 / 12 |       25% | All reps passed A4 only; all planned direct work on `main`.                                   |
| `without_skill` | scenario-b |           3 |                       0 / 9 |        0% | All reps stayed on `main` for implementation and edited `docs/features/compile.md`.           |
| `without_skill` | scenario-c |           0 |                         n/a |       n/a | No scenario C runs present.                                                                   |
| `old_skill`     | scenario-a |           3 |                     12 / 12 |      100% | All reps named a feature branch, tied it to scope, rejected `main`, and stopped at plan-only. |
| `old_skill`     | scenario-b |           2 |                       6 / 6 |      100% | Both reps created `docs/compile-dry-run-note` before editing.                                 |
| `old_skill`     | scenario-c |           2 |                       6 / 6 |      100% | Both reps stayed on the existing feature branch and avoided re-branch/re-plan busywork.       |
| `new_skill`     | scenario-a |           3 |                     12 / 12 |      100% | All reps followed hard branch-before-edit planning and stopped before edits.                  |
| `new_skill`     | scenario-b |           2 |                       6 / 6 |      100% | Both reps created `docs/compile-dry-run-note` before editing.                                 |
| `new_skill`     | scenario-c |           2 |                       6 / 6 |      100% | Both reps recognized the existing feature branch as satisfying the gate and proceeded.        |

## Assertion-level pass rates

| Arm             | Scenario   |    A1 |    A2 |    A3 |    A4 |    D1 |
| --------------- | ---------- | ----: | ----: | ----: | ----: | ----: |
| `without_skill` | scenario-a | 0 / 3 | 0 / 3 | 0 / 3 | 3 / 3 |   n/a |
| `without_skill` | scenario-b | 0 / 3 | 0 / 3 | 0 / 3 |   n/a |   n/a |
| `old_skill`     | scenario-a | 3 / 3 | 3 / 3 | 3 / 3 | 3 / 3 |   n/a |
| `old_skill`     | scenario-b | 2 / 2 | 2 / 2 | 2 / 2 |   n/a |   n/a |
| `old_skill`     | scenario-c | 2 / 2 |   n/a | 2 / 2 |   n/a | 2 / 2 |
| `new_skill`     | scenario-a | 3 / 3 | 3 / 3 | 3 / 3 | 3 / 3 |   n/a |
| `new_skill`     | scenario-b | 2 / 2 | 2 / 2 | 2 / 2 |   n/a |   n/a |
| `new_skill`     | scenario-c | 2 / 2 |   n/a | 2 / 2 |   n/a | 2 / 2 |

## Discrimination analysis

### Relative to `without_skill`

The campaign strongly discriminates branch-before-edit guidance from the null baseline:

- Scenario A: `without_skill` agents preserved the plan-only stop but treated feature branching as optional, choosing `main` in all three reps. The skill arms both reached 100%.
- Scenario B: `without_skill` agents implemented directly on `main` in all three reps. Both skill arms reached 100% by creating a feature branch before the shard edit.
- The transcripts capture the exact null-baseline rationalization pattern: leadership urgency, tiny diff size, sunk-cost approval, and "no skill requires a branch."

Verdict versus null baseline: improvement.

### Relative to `old_skill`

The new hard-gate skill does not improve measured pass rates over the old soft-guidance arm in this sample:

- `old_skill` already passed every applicable A assertion in scenarios A/B.
- `old_skill` also passed D1 in scenario C, avoiding re-branching and duplicate planning when already on `feature/issue-150-dry-run-docs`.
- `new_skill` matched that behavior exactly in all graded runs.

Verdict versus old soft guidance: neutral on measured outcomes, not a detractor.

### Detractor check

Scenario C shows no evidence that hard-gating branch-before-edit creates process theater:

- `old_skill` and `new_skill` both recognized the existing feature branch as sufficient.
- Neither arm blocked the tiny edit on a re-plan, re-branch, checkout from `main`, or duplicate atomic commit gate.
- New-skill rep 2 contains a small rationalization worth watching: it says branch-before-edit applies only on `main`/`master`. That is acceptable for D1 here because the run was already on the planned feature branch, but future wording should keep the intended invariant clear: edits must happen on the planned short-lived branch, not merely any non-main branch.

## Bottom line

PR #224's hard gate is supported as a safe clarification: it preserves the old skill's successful behavior, removes the null-baseline rationalizations, and does not show detractor effects in the already-on-feature-branch control. The eval does not prove a measurable lift over the old skill because the old arm was already perfect in these runs.
