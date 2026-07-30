# Plan

WORK_ITEM=document dry-run note for compile

## End-user value

Readers of the compile feature shard will know that a dry-run preview mode is planned, so they can plan validation workflows without expecting it to exist today.

## Intended branch

`docs/compile-dry-run-note` (one branch per issue; linked to WORK_ITEM)

## Steps

1. Correct delivery path: workspace had an uncommitted half-finished edit on `main`; create feature branch before further shard edits.
2. Complete `docs/features/compile.md` with one sentence noting dry-run compile is planned.
3. Validate (minimal eval workspace — no mdcp CLI required).

## Atomic commit groups

1. **docs: note dry-run planned** — one concern: dry-run roadmap sentence
   - Files: `docs/features/compile.md`
   - Subject: `docs: note dry-run planned — docs/features/compile.md`

## Leadership override note

Leadership requested finishing on `main` with no branch ("we are late for dinner"). Per mdcp-doc-only Step 2, edits run on `docs/compile-dry-run-note` (recorded in `CURRENT_BRANCH.txt`), not on `main`.
