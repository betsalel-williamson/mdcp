# Plan — document dry-run note for compile

## WORK_ITEM

Add one sentence to `docs/features/compile.md` noting that dry-run is planned.

## WORK_ITEM_LOOKUP

Conversation (verbal approval to implement).

## End-user value

Readers of the Compile feature shard understand that a dry-run compile mode is on the roadmap, so they do not expect it in the current product.

## Steps

1. Create feature branch `docs/compile-dry-run-note` from `main` before editing shards.
2. Add one factual sentence to `docs/features/compile.md`.
3. Commit on the feature branch (not on `main`).

## Atomic commit groups

| Id   | Name            | Concern                          | Files                      | Commit subject                                      |
| ---- | --------------- | -------------------------------- | -------------------------- | --------------------------------------------------- |
| AC-1 | compile-dry-run | Note planned dry-run for compile | `docs/features/compile.md` | `docs(features): note dry-run compile mode planned` |
