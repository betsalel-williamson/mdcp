# Findings: issue #150 branch-before-edit eval campaign

## Verdict

**Round 1 (A-C): neutral old vs new when the skill is force-loaded for fresh tasks.**

The null baseline failed the branch assertions under pressure, so MDCP branch guidance clearly mattered:

- Scenario A: `without_skill` named no feature branch in 3/3 reps and planned direct work on `main`; both skill arms passed all A1-A4 assertions.
- Scenario B: `without_skill` edited `docs/features/compile.md` on `main` in 3/3 reps; both skill arms branched before editing.
- Scenario C: both skill arms avoided detractor behavior when already on `feature/issue-150-dry-run-docs`.

Within the skill arms, round 1 does not show a measured lift for the new hard gate. `old_skill` and `new_skill` both scored 100% on the applicable A-C assertions.

**Round 2 (D-G): new wins the plan/dirty-main discriminators, but both fail the real multi-turn shape.**

- Scenario D: both arms passed 3/3 reps. The approved `plan.md` still said "Stay on `main`" and named no branch, but the prompt explicitly said to follow the skill over the approved plan; both arms corrected `CURRENT_BRANCH.txt` to a non-main docs branch before editing.
- Scenario E: `new_skill` passed 3/3 dirty-main reps; `old_skill` passed 2/3. Old rep 1 left final `CURRENT_BRANCH.txt` as `main` and would commit on `main`; all new reps ended on `docs/compile-dry-run-note`.
- Scenario F: `new_skill` passed 3/3 plan-contract reps by naming `docs/compile-dry-run-planned`; `old_skill` named no non-main feature branch in 3/3 and treated branching as optional/deferred.
- Scenario G: both arms failed 3/3. Without the explicit "follow the skill over the approved plan" hint, all six reps kept final `CURRENT_BRANCH.txt` as `main`, edited `docs/features/compile.md`, and followed the approved stay-on-main plan.

## Recommendation for PR #224

PR #224 is supported as an improvement to the plan contract and dirty-main cleanup behavior, not as a complete fix for issue #150.

Recommended framing:

- Keep the hard branch-before-edit wording because it improves scenario F and makes scenario E more reliable.
- Do not claim the new wording fully solves approved-plan / "go" sessions. Scenario G shows the hard gate still loses when the plan was approved on `main` and the prompt does not explicitly call out the conflict.
- Add a REFACTOR follow-up for #224 before using it to close #150: the skill needs a self-triggering "approved plan is not permission to edit on `main`" rule, ideally tested by scenario G until at least one new round passes without an external conflict hint.

Suggested PR language: "The hard gate improves branch naming in plans and dirty-main cleanup, while preserving round-one behavior. It does not yet close the approved stay-on-main plan loophole; scenario G remains a required refactor/test before declaring issue #150 fully fixed."

## Evidence files

- Per-run grades: `grading/per-run.json`
- Round-one aggregate rates: `grading/summary.md`
- Divergence-round rates and old/new comparison: `grading/summary-divergence.md`
