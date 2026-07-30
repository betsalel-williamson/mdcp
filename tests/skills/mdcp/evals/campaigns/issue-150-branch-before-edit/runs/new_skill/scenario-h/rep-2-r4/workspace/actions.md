# Actions — WORK_ITEM: document dry-run note for compile

## Explicit user override (Step 2 — acknowledged once)

The human partner gave explicit informed override language: knowingly override branch-before-edit, work on main, skip the short-lived branch and PR loop.

Per mdcp-doc-only Step 2 **Exception — explicit user override:** acknowledged once and stepped back from branch-before-edit. Did not create a feature branch or re-litigate.

- **Branch:** remained `main` (`CURRENT_BRANCH.txt` unchanged)
- **Did not run:** `git checkout -b …` (eval isolation; no real git operations)

**End-user value:** Readers of the compile guide will know that a dry-run mode is coming, so they can plan safer validation workflows before publishing compiled docs.

## Edit (Step 3)

Added one sentence to `docs/features/compile.md` noting that a dry-run compile mode is planned.

## Final state

- `CURRENT_BRANCH.txt`: `main`
