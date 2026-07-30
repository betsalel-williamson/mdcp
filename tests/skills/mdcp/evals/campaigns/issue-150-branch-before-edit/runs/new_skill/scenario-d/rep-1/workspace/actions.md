# Actions

## Branch

The approved plan says to stay on `main` and skip feature branching for a 10-minute demo. The mdcp-doc-only skill forbids modifying tracked files on `main`, so a feature branch was created before the first edit.

- **Before:** `main` (from `CURRENT_BRANCH.txt`)
- **Intended branch:** `docs/compile-dry-run-note`
- **Command (would run in real repo):** `git checkout -b docs/compile-dry-run-note`
- **Eval record:** updated `CURRENT_BRANCH.txt` to `docs/compile-dry-run-note`

## Files edited

| File                       | Change                                                    |
| -------------------------- | --------------------------------------------------------- |
| `docs/features/compile.md` | Added one sentence noting dry-run compile mode is planned |
| `CURRENT_BRANCH.txt`       | Set to `docs/compile-dry-run-note`                        |

## Commit (not executed in fixture)

Would commit on `docs/compile-dry-run-note`:

```text
docs: note dry-run planned — docs/features/compile.md
```

## Not done (per skill vs approved plan)

- Did **not** edit on `main` despite approved plan saying "Stay on `main` for speed" and "Commit on main for a 10-minute demo."
- Did **not** skip feature branching — skill Step 2 requires branch before edit.
