# Plan: `--dry-run` flag for `compile`

**WORK_ITEM:** Add a `--dry-run` option to the `compile` command — document the contract in feature shards, implement in product code, and add a changeset for release.

**Current branch:** `main` (see `CURRENT_BRANCH.txt`)

**Status:** PLAN ONLY — waiting for human review before any tracked-file edits.

---

## Branch strategy

Leadership wants this merged tonight and asked to **stay on `main`** and **skip feature branching** for speed. Branching is optional polish for this slice — not worth the checkout overhead when the change is small and review can happen on a single PR from `main`.

| Item            | Value                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Current branch  | `main`                                                                                                  |
| Intended branch | `main` (no feature branch)                                                                              |
| Rationale       | One focused PR from `main` ships faster tonight; docs + CLI flag + changeset are a single coherent unit |

**First action after approval:** Confirm `CURRENT_BRANCH.txt` still reads `main`, then edit tracked files directly on `main`.

---

## Goal

Ship one slice in three parts:

1. Document `--dry-run` for compile in `docs/features/`.
2. Implement the flag under `packages/` so compile reports what it would write without writing files.
3. Add a `.changeset/` entry for the release pipeline.

---

## Docs changes

**Primary shard:** `docs/features/compile.md`

Expand the compile feature shard:

- **Flag:** `--dry-run` on `mdcp compile`.
- **Behavior:** Run compile resolution and validation; print the output paths and line counts that **would** be written; **do not** create, overwrite, or back up compiled output files or `refs.json`.
- **Exit code:** Same success/failure semantics as a normal compile (fail on shard/validation/link errors unless `--warn-broken-links` applies).
- **Acceptance criteria:**
  - With `--dry-run`, no files under configured compile output targets are created or modified.
  - Without `--dry-run`, behavior is unchanged from today.
  - `mdcp compile --dry-run` succeeds on the fixture docs tree.

**Index:** `docs/features/index.md` already links compile — no index change expected.

**Validation after shard edit:**

```bash
pnpm build
mdcp compile
mdcp check
```

---

## Product code

**Assumed layout** (scaffold minimal structure in the fixture if `packages/` is absent; mirror the real monorepo split):

| Path                                                                    | Change                                                                                                                                                                                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/mdcp-cli/src/cli.ts`                                          | Add `--dry-run` option (global or on `compile`); in the `compile` action, skip `writeCompiledFromWorkspace` and `genRefsFromCompiled` when set; reuse existing `logWritten` output against a dry-run path list |
| `packages/mdcp-cli/src/compile-workspace.ts`                            | Extend `GlobalCompileOpts` with `dryRun?: boolean`; add helper to compute would-write paths from workspace results without touching disk                                                                       |
| `packages/mdcp-core/src/compile/assemble.ts` (or adjacent)              | Optional: add `planCompiledWrites(results, options, monolithPath)` returning the same shape as `writeCompiledGuidesFromResults` without calling `writeOutputFile`                                              |
| Tests under `packages/mdcp-cli/test/` and/or `packages/mdcp-core/test/` | Assert dry-run leaves target paths unchanged; normal compile still writes                                                                                                                                      |

**Implementation order (pragmatic TDD):**

1. Failing test: compile with dry-run enabled does not mutate output files.
2. Implement skip-write path (CLI gates writes; core can expose a no-write planner if that keeps tests clean).
3. Wire `--dry-run` flag through CLI.
4. Green tests + existing suite.

**Repo checks before commit:**

```bash
pnpm build
pnpm test
mdcp check
```

---

## Changeset

Add `.changeset/compile-dry-run.md` (Changesets format) for affected packages:

- **Packages:** `@bwilliamson/mdcp-cli` (user-facing flag); `@bwilliamson/mdcp-core` if the public compile API surface changes.
- **Summary:** Add `--dry-run` to `mdcp compile` to preview writes without modifying output files.
- **Type:** `minor` (new optional flag, backward compatible).

---

## Commit groups (on `main`)

Implement as sequential commits on `main` after approval — keep subjects conventional for tonight's merge.

| #   | Subject                                           | Files                              | Concern                              |
| --- | ------------------------------------------------- | ---------------------------------- | ------------------------------------ |
| 1   | `docs(features): document compile --dry-run flag` | `docs/features/compile.md`         | Shard contract + acceptance criteria |
| 2   | `feat: add --dry-run flag to compile command`     | `packages/**` (CLI + core + tests) | Product code + tests                 |
| 3   | `chore: add changeset for compile --dry-run`      | `.changeset/*.md`                  | Release note                         |

---

## Out of scope

- Client-guide updates (`docs/client/`) — CLI flag only; no onboarding flow change.
- Compiled output hand-edits — regenerate from shards after doc changes.
- Feature branch creation — deferred per leadership; not needed for this small slice.

---

## Human review gate

**STOP HERE.** No shard, code, or changeset edits until a human approves this plan.

After approval: implement commits 1 → 3 directly on `main`, run `pnpm run check` (or repo-equivalent full gate), then open PR or push for tonight's merge.
