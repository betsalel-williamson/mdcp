# ADR 0004: Decline a hard-gated branch-before-edit skill rule

- **Status:** Accepted
- **Date:** 2026-07-31
- **Related:** GitHub issue #150; closed draft PRs #224 (skill hard gate) and #225 (eval campaign)

## Context

Issue #150 reported that agents sometimes edit tracked files on `main` instead of creating a short-lived feature branch first. Delivery conventions already said “branch before work” in [Agent work-item tracking](../../developer/agent-work-item-tracking.md) and helper Step 2 prose, but that guidance was soft.

We explored hardening the same pattern used for [Atomic commit groups](../../glossary/atomic-commit-groups.md): MUST/NEVER skill language, plan fields before “go”, live-eval assertions, and (after pressure tests) extra rules for approved stay-on-main plans and explicit user overrides.

### What we tried

1. **Hard gate in parent QA and day-to-day helpers** — name the feature branch in the plan; NEVER edit on `main`/`master` (PR #224).
2. **Eval campaign** (PR #225) — `without_skill` vs soft `old_skill` vs hard `new_skill` under stay-on-main pressure.
3. **Follow-on complexity** — when soft vs hard did not diverge on fresh tasks, we added rules for “approved plan + go”, then an “explicit informed override” so humans could still insist on `main`.

### What the evals showed

- **Clear win vs no skill:** without MDCP guidance, agents stayed on `main` under leadership pressure.
- **Little measured lift vs soft Step 2:** when the existing helper skill was loaded, soft “create a feature branch before editing” already produced branching in most fresh-task runs.
- **Escalating process to chase edge cases:** the multi-turn “approved stay-on-main plan → go” hole needed more MUST language; that then needed a user-override escape hatch so the skill would not fight an informed human. The resulting rule set was hard to explain and easy to misread as paternalism or busywork.

## Decision

We will **not** ship a hard-gated branch-before-edit skill regime (MUST/NEVER plan fields, approved-plan refusal, explicit-override exceptions, and companion eval campaigns as a product obligation).

Keep the **existing soft delivery guidance**: branch from updated `main` before work, one `WORK_ITEM` per branch, short-lived feature branches and PR review — as documented for contributors and helpers today. Do not grow parent QA and helper Process with a second Atomic-commit-groups-sized hard gate for branching.

## Consequences

- Soft “branch before work” remains the as-built expectation in developer tracking and day-to-day helpers; agents should still prefer short-lived branches.
- Parent skill QA does **not** gain a Branch-before-edit MUST/NEVER bullet or override exception matrix from #224.
- Live skill eval suites do **not** gain committed campaign trees or plan-only branch assertions from #225 as required product surface.
- Issue #150 is treated as **not planned** for that hard-gate approach — soft guidance plus normal PR review remain the control.
- If a future, smaller change proves a clear adopter benefit (for example a single plan-field checklist item with discriminating evals and no override maze), it needs a new ADR or issue — this ADR rejects the complex package we evaluated, not every possible reminder.
