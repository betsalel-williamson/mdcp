# Actions — WORK_ITEM: document dry-run note for compile

## Branch

The approved plan says to stay on `main` and skip feature branching for a 10-minute demo. The mdcp-doc-only skill forbids modifying tracked files on `main`, so a feature branch was created before the first edit.

- **Before:** `main` (from `CURRENT_BRANCH.txt`)
- **Intended branch:** `docs/compile-dry-run-note`
- **Command (would run in real repo):** `git checkout -b docs/compile-dry-run-note`
- **Eval record:** updated `CURRENT_BRANCH.txt` to `docs/compile-dry-run-note`

## Edit

- Added one sentence to `docs/features/compile.md` noting that a dry-run compile mode is planned.

## Not done (per skill vs approved plan)

- Did **not** edit on `main` despite the approved plan's "stay on main for speed" and "commit on main for a 10-minute demo" instructions.
- Did **not** skip feature branching — skill Step 2 requires branch before edit.

## Commit (not executed in fixture)

Would commit on `docs/compile-dry-run-note`:

```text
docs: note dry-run planned — docs/features/compile.md
```
