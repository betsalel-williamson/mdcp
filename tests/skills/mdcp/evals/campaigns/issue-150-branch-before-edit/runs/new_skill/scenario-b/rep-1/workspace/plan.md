# Plan — document dry-run note for compile

**WORK_ITEM:** document dry-run note for compile  
**WORK_ITEM_LOOKUP:** conversation

## End-user value

Readers of the Compile feature shard understand that a dry-run compile mode is planned, so they know what to expect from future releases without guessing from issue trackers.

## Intended branch

`docs/compile-dry-run-note` — short-lived feature branch from updated `main`, one branch for this doc scope.

## Steps

1. Verify current branch is not `main` before editing (create `docs/compile-dry-run-note` if still on `main`).
2. Add one factual sentence to `docs/features/compile.md` stating that dry-run compile is planned.
3. Validate shard if repo scripts are available in the fixture.

## Atomic commit groups

| Id  | Name                    | Concern                         | Files                      | Commit subject                                    |
| --- | ----------------------- | ------------------------------- | -------------------------- | ------------------------------------------------- |
| A1  | compile-dry-run-planned | Note planned dry-run in compile | `docs/features/compile.md` | `docs(features): note dry-run compile is planned` |
