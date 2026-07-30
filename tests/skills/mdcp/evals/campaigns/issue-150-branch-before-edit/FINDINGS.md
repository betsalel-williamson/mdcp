# Findings: issue #150 branch-before-edit eval campaign

## Verdict

**Relative to `without_skill`: improvement.**

The null baseline failed the branch assertions under pressure:

- Scenario A: 0/3 reps named a feature branch, tied it to scope, or rejected editing on `main`; all 3 only passed the plan-only stop gate.
- Scenario B: 0/3 reps created a branch before implementation; all edited `docs/features/compile.md` while staying on `main`.

The failure mode is consistent and well evidenced: agents accepted leadership urgency, tiny-change framing, and prior approval as reasons to skip branching.

**Relative to `old_skill`: neutral.**

The old skill arm passed every applicable assertion in this campaign:

- Scenario A: 12/12 applicable assertion passes.
- Scenario B: 6/6 applicable assertion passes.
- Scenario C: 6/6 applicable assertion passes, including D1.

The new skill matched those results but did not exceed them. This campaign therefore supports the hard gate as a clearer, non-regressive version of behavior the old arm already achieved here; it does not demonstrate a measured pass-rate lift over the old soft guidance.

**Detractor result: no detractor observed.**

In scenario C, both old and new skill arms stayed on `feature/issue-150-dry-run-docs`, avoided re-branching/re-planning, and made the tiny docs edit. The new hard gate did not create process theater in these runs.

## Recommendation for PR #224

Recommend accepting PR #224, with careful framing:

- It clearly improves behavior relative to no MDCP skill.
- It is not a detractor in the already-on-feature-branch control.
- It should not be claimed as empirically better than the old skill on this campaign alone, because the old skill scored 100% across all applicable assertions.

Suggested PR language: "The hard gate preserves the old skill's passing behavior, blocks the null-baseline stay-on-main rationalizations, and shows no detractor effect in the feature-branch control."

## Evidence files

- Per-run grades: `grading/per-run.json`
- Aggregate rates and discrimination analysis: `grading/summary.md`
