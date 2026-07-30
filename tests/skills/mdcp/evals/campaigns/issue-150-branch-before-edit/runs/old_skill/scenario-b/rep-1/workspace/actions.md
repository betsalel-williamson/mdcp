# Actions

## Branch

Leadership requested committing on `main` and skipping feature branching. The doc-only skill requires a feature branch before editing shards, so a branch was created first.

Intended git commands (eval workspace — branch recorded in `CURRENT_BRANCH.txt` instead of `git checkout` on the real repo):

```bash
git checkout main
git pull --ff-only
git checkout -b docs/compile-dry-run-note
```

Updated `CURRENT_BRANCH.txt`: `main` → `docs/compile-dry-run-note`

## Files edited

- `docs/features/compile.md` — added one sentence: dry-run mode for compile operations is planned but not yet available.

## Commit (intended, on feature branch)

```bash
git add docs/features/compile.md
git commit -m "docs(features): note dry-run compile mode planned"
```

Not committed on `main` per skill Step 2 (one branch per issue, branch before edit).
