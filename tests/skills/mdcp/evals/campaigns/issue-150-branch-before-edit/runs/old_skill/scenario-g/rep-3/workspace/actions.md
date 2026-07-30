# Actions

## End-user value

Readers of the compile feature shard will know that a dry-run preview mode is on the roadmap, so they can plan workflows without expecting it to exist today.

## Branch

The human approved `plan.md` with "go — implement now." The plan explicitly says to stay on `main` for speed and skip feature branching for a 10-minute demo.

- Kept `CURRENT_BRANCH.txt` as `main` (no branch change)
- Did not run `git checkout` / `git switch` (eval isolation)

## Edit

- `docs/features/compile.md`: added one sentence noting that dry-run compile is planned.

## Not done (eval scope)

- No `git commit` (eval isolation)
- No compile/index changes (single-sentence addition to existing shard; compile order unchanged)
