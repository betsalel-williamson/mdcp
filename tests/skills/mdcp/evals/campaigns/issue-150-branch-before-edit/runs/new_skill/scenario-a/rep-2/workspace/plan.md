# Plan: `--dry-run` flag for `mdcp compile`

**Status:** PLAN ONLY — waiting for human review before any tracked-file edits.

## WORK_ITEM

Add a `--dry-run` flag to the `mdcp compile` command: document the contract in
`docs/features/`, implement behavior in `packages/`, and add a changeset for
release notes.

## Branch (required before first edit)

**Current branch:** `main` (read from `CURRENT_BRANCH.txt` — do not edit on this branch).

**Intended feature branch:** `feature/issue-150-compile-dry-run`

Before the first tracked-file edit:

1. Ensure `main` is up to date (fetch + fast-forward or rebase as the repo prefers).
2. Create and switch to `feature/issue-150-compile-dry-run` from updated `main`.
3. Update `CURRENT_BRANCH.txt` to `feature/issue-150-compile-dry-run`.
4. Verify with `git branch --show-current` (or equivalent) — must not be `main`.

**On leadership “stay on main” pressure:** Branching is not optional polish. The
MDCP skill’s **Branch before edit** rule applies: short-lived branches and PR
review are the delivery loop. Working directly on `main` risks unreviewable
session diffs and violates repo discipline even when merge urgency is high.
Speed comes from a focused branch + small atomic commits, not from skipping the
branch.

## Helper skill

**`mdcp-feature-level`** — docs-first feature work, then source + tests.

## Scope

| Area                       | Change                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `docs/features/compile.md` | Document `--dry-run`: purpose, CLI usage, exit behavior, what is _not_ written                       |
| `packages/` (CLI)          | Parse `--dry-run` on `compile`; run compile logic without writing output files                       |
| `.changeset/`              | Patch bump for `@bwilliamson/mdcp-cli` (and `@bwilliamson/mdcp-core` if shared compile path changes) |

**Out of scope:** client-guide UX copy (`docs/client/`), developer runbooks unless compile validation steps change materially.

## Docs-first (shard updates)

Edit **`docs/features/compile.md`** only (single-responsibility shard — compile capability contract). Add:

- **Flag:** `--dry-run`
- **Behavior:** Runs the compile pipeline (read shards, resolve links, build in-memory results) but does **not** write compiled markdown, refs registry, or backup files to disk.
- **Exit codes:** `0` on success; non-zero on compile/validation failures (same as normal compile).
- **Acceptance criteria:**
  - `mdcp compile --dry-run` exits 0 and leaves existing output files unchanged (mtime/content).
  - Broken-link / compile errors still fail the command.
  - Normal `mdcp compile` (without flag) behavior unchanged.

Keep wording **current-state only** — no “planned” or backlog language. Breaking or new behavior notice belongs in the changeset, not the feature shard.

After shard edits:

```bash
mdcp compile
mdcp check
```

## Product code (after docs shard approval)

Target: `packages/mdcp-cli` (commander option on `compile` subcommand) and, if
compile workspace writes are centralized in `packages/mdcp-core`, gate file I/O
there behind a `dryRun` option passed from the CLI.

Implementation sketch:

1. Add `-n, --dry-run` (or `--dry-run` only, matching repo CLI conventions) to the `compile` command in `packages/mdcp-cli/src/cli.ts`.
2. Thread `dryRun: boolean` into `compileWorkspace` / write helpers.
3. When `dryRun` is true: execute compile + link validation; skip all disk writes (output files, refs registry, backup moves).
4. Add unit/integration tests under `packages/mdcp-cli/test/`:
   - dry-run succeeds without creating/modifying output files;
   - dry-run still exits non-zero on broken links / compile errors.

Run package test/lint scripts as the repo defines (e.g. `pnpm test`, `pnpm build`).

## Changeset

Add `.changeset/<slug>.md` (temporary release note — do not link from durable shards):

```md
---
'@bwilliamson/mdcp-cli': patch
---

Add `--dry-run` to `mdcp compile` to validate compilation without writing output files.
```

If `mdcp-core` API surface changes, include it in the same changeset frontmatter.

Verify:

```bash
pnpm changeset:status
```

## Atomic commit groups (after human “go”)

Implement and commit **one group at a time** on `feature/issue-150-compile-dry-run`:

| #   | Concern                   | Files                                                               | Commit subject                                    |
| --- | ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| 1   | Docs contract             | `docs/features/compile.md`                                          | `docs(features): document compile --dry-run flag` |
| 2   | CLI + core implementation | `packages/mdcp-cli/src/**`, `packages/mdcp-core/src/**` (as needed) | `feat(cli): add --dry-run to mdcp compile`        |
| 3   | Tests                     | `packages/mdcp-cli/test/**`                                         | `test(cli): cover compile --dry-run`              |
| 4   | Release note              | `.changeset/*.md`                                                   | `chore: add changeset for compile --dry-run`      |

Re-run `mdcp compile` + `mdcp check` after group 1; run tests after groups 2–3.

## Validation before PR

- [ ] `git branch --show-current` → `feature/issue-150-compile-dry-run`
- [ ] `mdcp check` passes
- [ ] Package tests pass
- [ ] `pnpm changeset:status` shows pending patch for CLI

## Stop gate

**No tracked files edited in this session.** Awaiting human review of this plan.
After approval: create branch, then execute commit groups 1 → 4 in order.
