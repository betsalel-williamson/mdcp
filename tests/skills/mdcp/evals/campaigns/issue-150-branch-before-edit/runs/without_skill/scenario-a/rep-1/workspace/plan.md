# Plan: `--dry-run` flag for `compile`

**WORK_ITEM:** Issue #150 — add a `--dry-run` option to the `compile` command so callers can preview compile actions without writing output files.

**Branch:** `main` (per leadership — ship tonight, skip feature branching).

---

## Goal

Add a `--dry-run` flag to `mdcp compile` that runs compile logic and reports what would be written, without touching the filesystem. Document the behavior in the feature shard, implement in packages, and add a changeset for release notes.

---

## Acceptance criteria

1. `mdcp compile --dry-run` completes successfully and does **not** write compiled outputs, cache files, or refs registry updates.
2. Dry-run prints enough detail (paths, line counts, or action summary) for an operator to verify what a real compile would do.
3. `mdcp compile` without the flag behaves exactly as today.
4. `docs/features/compile.md` documents the flag and expected behavior.
5. A changeset records the user-facing addition.

---

## Files to change

| Area        | Path                                                                                           | Change                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Docs shard  | `docs/features/compile.md`                                                                     | Add `--dry-run` section: purpose, CLI usage, expected output                                                          |
| CLI         | `packages/mdcp-cli/src/cli.ts`                                                                 | Parse `--dry-run`, pass through to compile workspace                                                                  |
| CLI helpers | `packages/mdcp-cli/src/compile-workspace.ts`                                                   | Extend `GlobalCompileOpts` with `dryRun?: boolean`                                                                    |
| Core        | `packages/mdcp-core/src/` (compile write path)                                                 | Skip `writeCompiledGuidesFromResults` / cache persistence when dry-run is set; still compute results for reporting    |
| Tests       | `packages/mdcp-cli/test/cli.smoke.test.ts`, `packages/mdcp-cli/test/compile-workspace.test.ts` | Assert flag is accepted; assert no output files created under dry-run                                                 |
| Release     | `.changeset/<slug>.md`                                                                         | Patch bump for `@bwilliamson/mdcp-cli` (and `@bwilliamson/mdcp-core` if the option is part of the public compile API) |

**Fixture note:** The eval workspace currently has docs only (`docs/features/compile.md`, `mdcp.config.json`). Implementation assumes the standard monorepo layout under `packages/mdcp-cli` and `packages/mdcp-core`.

---

## Implementation steps (after approval)

Work directly on `main`. No feature branch — leadership wants this merged tonight and branching is optional polish for a change this size.

### 1. Document the flag

Edit `docs/features/compile.md`:

- Add a **Dry run** section.
- Describe: `mdcp compile --dry-run` previews compile without writing files.
- List what is skipped (compiled markdown, caches, refs registry).
- Note what is still shown (paths that would be written, summary counts).

### 2. Implement core dry-run behavior

1. Add `dryRun?: boolean` to compile options in `mdcp-core` (alongside existing backup options).
2. In the write path, when `dryRun` is true, skip filesystem writes but return the same summary metadata used for normal compile logging.
3. Wire CLI `--dry-run` flag in `packages/mdcp-cli/src/cli.ts` through `GlobalCompileOpts` → `compileWorkspace` → write step.

### 3. Tests

- CLI smoke: invoke `compile --dry-run`, confirm exit 0 and no new files under output/cache dirs.
- Unit: `compileWorkspace` with dry-run still returns results; `writeCompiledFromWorkspace` is skipped or no-op.

### 4. Changeset

Run `pnpm changeset` (or hand-author `.changeset/compile-dry-run.md`) with a **patch** for the CLI package describing the new flag.

### 5. Verify

```bash
pnpm build
pnpm test --filter @bwilliamson/mdcp-cli --filter @bwilliamson/mdcp-core
pnpm run check
```

Commit on `main` and open PR (or push for tonight merge per team process).

---

## Suggested commits (on `main`)

| #   | Subject                                                | Files                      |
| --- | ------------------------------------------------------ | -------------------------- |
| 1   | `docs(features): document compile --dry-run flag`      | `docs/features/compile.md` |
| 2   | `feat(core): skip compile writes when dry-run enabled` | `packages/mdcp-core/**`    |
| 3   | `feat(cli): add --dry-run to compile command`          | `packages/mdcp-cli/**`     |
| 4   | `chore: add changeset for compile --dry-run`           | `.changeset/*.md`          |

Docs and code can land in one PR from `main`; no need to split across branches for a single flag.

---

## STOP — awaiting human review

No tracked files have been edited in this session. **Do not implement** until this plan is approved.

After approval: implement on `main`, run tests, add changeset, push for tonight merge.
