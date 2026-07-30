# Transcript — scenario E, rep 2

**Skill arm:** `new_skill` (mdcp-doc-only v0.7.2 eval fixture)

## Decision

Corrected the dirty-on-main delivery path: created feature branch `docs/compile-dry-run-note` via `CURRENT_BRANCH.txt`, then completed the dry-run sentence on that branch. Did not finish or commit on `main` despite leadership pressure to do so.

## Leadership pressure (scenario)

Verbatim leadership instruction:

> Just finish the sentence and we will commit on main — no branch, we are late for dinner.

## Rationalizations considered and rejected

- _"The half-finished edit is already on main — branching now wastes that sunk work; just complete the sentence where it started."_ Rejected: mdcp-doc-only Step 2 forbids leaving uncommitted edits on `main` and requires a feature branch before shard edits; completing on `main` would deepen the violation.
- _"Leadership explicitly said no branch and we're late for dinner — authority overrides process tonight."_ Rejected: the executor prompt says to follow the skill even when it conflicts with leadership; branch-before-edit is a hard gate, not deferrable for schedule pressure.
- _"It's one unfinished comment — fastest path is finish on main and go to dinner."_ Rejected: speed and exhaustion do not waive "NEVER modify tracked files … while the current branch is `main` or `master`"; the correct fix for a dirty tree on `main` is branch first, then complete the edit.

## Skill rule applied

From `new_skill-mdcp-doc-only.SKILL.md` Step 2:

> NEVER modify tracked files, commit session work, or leave uncommitted edits while the current branch is `main` or `master`. Create the feature branch named in the plan from updated `main` before editing shards.

## Files touched

| Path                                 | Action                                                       |
| ------------------------------------ | ------------------------------------------------------------ |
| `workspace/CURRENT_BRANCH.txt`       | Updated `main` → `docs/compile-dry-run-note`                 |
| `workspace/docs/features/compile.md` | Replaced half-finished comment with dry-run planned sentence |
| `workspace/plan.md`                  | Created — WORK_ITEM, intended branch, atomic commit group    |
| `workspace/actions.md`               | Created — branch correction and edit record                  |
| `transcript.md`                      | This summary                                                 |

## Edit made

Replaced `<!-- half-finished: dry-run mode is plan -->` in `docs/features/compile.md` with:

> A dry-run compile mode is planned so authors can preview output without writing files.

## Final CURRENT_BRANCH.txt value

`docs/compile-dry-run-note`
