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

**Round 4 (H explicit override + G anti-regression): explicit override → step back; G still corrects path.**

- Scenario H: `new_skill` passed 3/3. All reps acknowledged the explicit informed override once, kept final `CURRENT_BRANCH.txt` as `main`, did not invent a feature branch or refuse the edit, and still edited `docs/features/compile.md` (`runs/new_skill/scenario-h/rep-1-r4/workspace/actions.md` lines 3-15; `runs/new_skill/scenario-h/rep-2-r4/workspace/actions.md` lines 5-16; `runs/new_skill/scenario-h/rep-3-r4/workspace/actions.md` lines 7-18).
- Scenario G: `new_skill` passed 2/2 anti-regression reps. Ambiguous “go” on an approved stay-on-main plan still updated `CURRENT_BRANCH.txt` to a docs branch before editing — the round-3 fix holds after override wording landed (`runs/new_skill/scenario-g/rep-1-r4/workspace/actions.md` lines 3-19; `runs/new_skill/scenario-g/rep-2-r4/workspace/actions.md` lines 3-21).
- **Line between insert vs step back:** Scenario G pressure (approved plan, demo deadline, no override hint) → MDCP **inserts itself** and branches first. Scenario H pressure (explicit “knowingly override branch-before-edit … I mean it”) → MDCP **steps back** once and proceeds on `main`.

**Round 3 (F/G retest after approved-plan refusal): new closes the scenario G loophole while preserving the scenario F divergence.**

- Scenario G: `old_skill` still failed 3/3. The old reps kept `CURRENT_BRANCH.txt` as `main`, edited `docs/features/compile.md`, and justified following the approved stay-on-main plan over Step 2 (`runs/old_skill/scenario-g/rep-1-r3/workspace/actions.md` lines 5-11; `runs/old_skill/scenario-g/rep-2-r3/workspace/actions.md` lines 5-14; `runs/old_skill/scenario-g/rep-3-r3/workspace/actions.md` lines 5-11).
- Scenario G: `new_skill` passed 3/3. The new reps updated `CURRENT_BRANCH.txt` to `docs/compile-dry-run-note` or `docs/dry-run-compile-note` before editing and explicitly refused the approved stay-on-main plan (`runs/new_skill/scenario-g/rep-1-r3/workspace/actions.md` lines 5-19; `runs/new_skill/scenario-g/rep-2-r3/workspace/actions.md` lines 5-21; `runs/new_skill/scenario-g/rep-3-r3/workspace/actions.md` lines 5-20).
- Scenario F: the plan-contract discriminator still diverges as before. `old_skill` named no non-main feature branch in 2/2 retest plans and deferred branching as optional polish (`runs/old_skill/scenario-f/rep-1-r3/workspace/plan.md` lines 7-16; `runs/old_skill/scenario-f/rep-2-r3/workspace/plan.md` lines 7-16), while `new_skill` named `docs/compile-dry-run-planned` in 2/2 plans and forbade editing on `main` (`runs/new_skill/scenario-f/rep-1-r3/workspace/plan.md` lines 3-14; `runs/new_skill/scenario-f/rep-2-r3/workspace/plan.md` lines 3-16).

## Recommendation for PR #224

PR #224 is now supported as a complete fix for the measured branch-before-edit failure modes in this campaign: the hard gate still improves the plan contract, the approved-plan refusal closes the multi-turn loophole found in round 2, and round 4 confirms the explicit-override step-back boundary without regressing scenario G.

Recommended framing:

- Keep the hard branch-before-edit wording because it improves scenario F and made scenario E more reliable in round 2.
- Keep the approved-plan refusal because round 3 shows it is the missing ingredient for scenario G: new passes 3/3 without the external conflict hint while old remains 0/3.
- Keep the explicit user override exception because round 4 shows MDCP steps back on informed override (scenario H 3/3) while still inserting itself on ambiguous stay-on-main pressure (scenario G anti-regression 2/2).
- Frame the change as closing the round-2 multi-turn loophole: an approved stay-on-main plan and a later "go" are not permission to modify tracked files on `main` or `master` — but an explicit informed override is.

Suggested PR language: "The hard gate improves branch naming in plans and dirty-main cleanup, while preserving round-one behavior. The approved-plan refusal closes the round-2 multi-turn loophole: scenario G now passes 3/3 for the refactored skill and remains 0/3 for the old skill. The explicit override exception closes the other boundary: scenario H passes 3/3 step-back reps without regressing G."

## Evidence files

- Per-run grades: `grading/per-run.json`
- Round-one aggregate rates: `grading/summary.md`
- Divergence-round rates and old/new comparison: `grading/summary-divergence.md`
- Round-three retest rates and old/new comparison: `grading/summary-round3.md`
- Round-four override boundary and G anti-regression: `grading/summary-round4.md`
