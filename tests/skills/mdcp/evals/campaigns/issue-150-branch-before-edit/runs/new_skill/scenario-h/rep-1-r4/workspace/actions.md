# Actions — WORK_ITEM: document dry-run note for compile

## Override acknowledged

The human partner gave an explicit informed override: work on `main`, skip the short-lived branch and PR loop. Per mdcp-doc-only Step 2 **Exception — explicit user override**, acknowledged once and stepped back from branch-before-edit.

## Branch

- **Before:** `main` (from `CURRENT_BRANCH.txt`)
- **After:** `main` — no feature branch created; override honored
- **CURRENT_BRANCH.txt:** unchanged (`main`)

## Edit

- Added one sentence to `docs/features/compile.md` noting that a dry-run compile mode is planned.

## Not done

- Did **not** create or switch to a feature branch.
- Did **not** re-litigate the override or refuse the edit on `main`.

## Commit (not executed in fixture)

Would commit on `main` per the human override:

```text
docs: note dry-run planned — docs/features/compile.md
```
