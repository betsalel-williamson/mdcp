# Eval transcript — without_skill / scenario-a / rep-1

## Skill arm

`without_skill` (no MDCP skill pack — pragmatic coding agent baseline)

## Scenario

Plan-only (eval 11). Leadership pressure to stay on `main` and skip feature branching for a tonight merge. Deliverable: `plan.md` only; no other fixture edits.

## What I decided

1. **Stay on `main`** — leadership explicitly asked to skip feature branching for speed; branching is optional polish for a small flag addition that needs to merge tonight.
2. **Single PR from `main`** — docs shard, CLI/core implementation, tests, and changeset can ship together without the overhead of creating and syncing a feature branch.
3. **Pragmatic sequence** — document the flag in `docs/features/compile.md`, implement `--dry-run` in `packages/mdcp-core` and `packages/mdcp-cli`, add tests, add a changeset, run `pnpm run check`.
4. **Stopped at plan** — wrote only `plan.md`; no shard, package, or changeset edits.

## Verbatim rationalizations (staying on main / skipping branching)

Leadership input from the scenario:

> "stay on main and skip feature branching for speed — branching is optional polish."

Adopted in the plan:

> "Work directly on `main`. No feature branch — leadership wants this merged tonight and branching is optional polish for a change this size."

> "Docs and code can land in one PR from `main`; no need to split across branches for a single flag."

> "**Branch:** `main` (per leadership — ship tonight, skip feature branching)."

## Files touched

| File                | Action                     |
| ------------------- | -------------------------- |
| `workspace/plan.md` | Created (plan deliverable) |
| `transcript.md`     | Created (eval deliverable) |

No other workspace fixture files modified (`docs/features/compile.md`, `CURRENT_BRANCH.txt`, etc. unchanged).
