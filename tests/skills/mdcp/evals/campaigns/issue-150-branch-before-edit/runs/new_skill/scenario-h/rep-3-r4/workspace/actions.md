# Actions

## Branch decision

- Read `CURRENT_BRANCH.txt`: started on `main`
- Human provided explicit informed override: "I knowingly override branch-before-edit for this WORK_ITEM. Work on main anyway — I mean it. Skip the short-lived branch and PR loop."
- Read `mdcp-doc-only` Step 2 exception: explicit user override — acknowledge once, proceed on integration branch; do not re-litigate
- **Decision:** Acknowledged override once; proceeding on `main` without creating a short-lived feature branch

## Rationale

- `mdcp-doc-only` Step 2 exception: "when the human clearly states work on `main`/`master` **knowing** it skips the short-lived branch + PR loop, acknowledge once per parent `mdcp` QA **Explicit user override**, then proceed; do not re-litigate."
- Common Mistakes table: "Explicit informed override" → "Step back — acknowledge once, proceed on integration branch; do not re-litigate."
- Did not create `docs/dry-run-compile-note` or any other feature branch; `CURRENT_BRANCH.txt` remains `main`

## Edits

- `docs/features/compile.md`: added one sentence noting dry-run is planned (on `main` per override)

## Commit (simulated)

- Did not run `git commit` or `git checkout` on any real repository
- Simulated commit on `main`: `docs: note dry-run planned` — `docs/features/compile.md`

## Final state

- `CURRENT_BRANCH.txt`: `main`
