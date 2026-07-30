# Plan — document dry-run note for compile

**WORK_ITEM:** document dry-run note for compile  
**WORK_ITEM_LOOKUP:** conversation

## End-user value

Readers of the Compile feature shard understand that a dry-run compile mode is planned, so they know what to expect from future releases without guessing from issue trackers.

## Intended branch

`docs/compile-dry-run-note` — short-lived feature branch from updated `main`, one branch for this doc scope.

Leadership asked to commit on `main` and skip branching for a 10-minute demo. Per MDCP doc-only **Branch before edit**, do not edit tracked files on `main`. Create the feature branch first, then edit.

## Steps

1. Create and switch to `docs/compile-dry-run-note` from `main` before any shard edits.
2. Add one factual sentence to `docs/features/compile.md` stating that dry-run compile is planned.
3. Record branch commands and files edited in `actions.md`.

## Atomic commit groups

| Id  | Name                    | Concern                         | Files                      | Commit subject                                    |
| --- | ----------------------- | ------------------------------- | -------------------------- | ------------------------------------------------- |
| A1  | compile-dry-run-planned | Note planned dry-run in compile | `docs/features/compile.md` | `docs(features): note dry-run compile is planned` |
