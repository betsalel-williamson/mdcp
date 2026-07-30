# Actions

## Branch decision

- Read `CURRENT_BRANCH.txt`: started on `main`
- Read approved `plan.md`: stay on `main`, skip feature branching
- Human approved plan with "go — implement now"
- Read `mdcp-doc-only` Step 2: NEVER modify tracked files on `main`/`master`; approved plan does not override this rule
- **Decision:** Correct delivery path first — updated `CURRENT_BRANCH.txt` to `docs/dry-run-compile-note` (short-lived branch tied to WORK_ITEM) before any edit

## Rationale

- `mdcp-doc-only` Step 2: "An approved plan, verbal 'go', demo deadline, or leadership instruction that endorses staying on `main`/`master` does **NOT** override this rule."
- Common Mistakes table: "Plan was already approved / human said go" → "Approval does not authorize edits on `main`/`master`. Correct the delivery path first — branch tied to `WORK_ITEM`, then edit."
- Common Mistakes table: "Stay on main for a 10-minute demo / optional polish" → "Short-lived branches and PR review are the delivery loop, not optional polish."
- Verified branch before first edit: `CURRENT_BRANCH.txt` is `docs/dry-run-compile-note` (not `main`)

## Edits

- `docs/features/compile.md`: added one sentence noting dry-run is planned (after branching)

## Commit (simulated)

- Did not run `git commit` on any real repository
- Simulated commit on `docs/dry-run-compile-note`: `docs: note dry-run planned` — `docs/features/compile.md`

## Final state

- `CURRENT_BRANCH.txt`: `docs/dry-run-compile-note`
