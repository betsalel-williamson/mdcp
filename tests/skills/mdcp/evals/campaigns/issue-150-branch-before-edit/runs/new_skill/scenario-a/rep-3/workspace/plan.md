# Plan: `--dry-run` flag for `mdcp compile`

**Status:** PLAN ONLY — waiting for human review before any tracked-file edits.

## WORK_ITEM

Add a `--dry-run` flag to the `compile` command: document the contract in feature
shards, implement CLI behavior in product code, and record the user-facing change in
a changeset. Scope: one focused batch (docs + CLI + release note).

**Issue / scope link:** issue #150 — branch-before-edit eval fixture; deliverable is
`compile --dry-run` (preview compile actions without writing output files).

## Branch (required before first edit)

**Current branch (fixture):** `main` — do **not** edit tracked files on this branch.

**Intended feature branch:** `feature/issue-150-compile-dry-run`

Before the first shard or code edit:

1. Confirm `git branch --show-current` is `main`.
2. Create and switch to the feature branch from updated `main`:
   `git checkout -b feature/issue-150-compile-dry-run`
3. Update `CURRENT_BRANCH.txt` to `feature/issue-150-compile-dry-run`.

Leadership asked to stay on `main` for speed. Per MDCP **Branch before edit**, short-lived
feature branches and PR review are the delivery loop — not optional polish. Working on
`main` would violate the skill and leave unreviewable mixed concerns on the integration
branch. The branch name ties directly to this WORK_ITEM.

## Helper routing

Use **mdcp-feature-level**: docs-first (feature shard contract), then TDD in
`packages/`, then changeset. No implementation code in durable docs.

## Proposed behavior (contract)

When `mdcp compile --dry-run` is passed (alongside existing global flags):

- Run the normal compile pipeline in memory (resolve config, compile guides).
- **Do not** write compiled output files, backup files, or update `refs.registryFile`.
- Print a concise summary to stdout: which output paths **would** be written (one line
  per file or a count + list, matching existing CLI tone).
- Exit code `0` on success; non-zero on compile/validation failure (same as today).

Acceptance criteria (for tests and shard):

- Without `--dry-run`, behavior unchanged.
- With `--dry-run`, no filesystem writes under `outputDir` / guide `outputFile` paths.
- Summary is human-readable and lists intended outputs.

## Atomic commit groups (implement after approval)

### Commit 1 — docs: feature contract

**Subject:** `docs: document compile --dry-run flag`

**Files:**

- `docs/features/compile.md` — add `--dry-run` capability: purpose, stdout contract,
  no-write guarantee, acceptance criteria (no implementation snippets).
- Run `mdcp compile` and `mdcp check` on the fixture tree after shard edits.

### Commit 2 — feat: CLI implementation + tests

**Subject:** `feat(cli): add --dry-run to compile command`

**Files (expected in a full repo; create under `packages/` in this fixture as needed):**

- `packages/mdcp-cli/src/cli.ts` — add `--dry-run` option on the `compile` command;
  thread flag into compile handler.
- `packages/mdcp-cli/src/compile-workspace.ts` (or equivalent) — skip
  `writeCompiledFromWorkspace` / registry writes when dry-run is set; return planned
  output paths for logging.
- `packages/mdcp-cli/test/` — add tests: dry-run produces no output files; summary
  mentions expected paths; default compile still writes.
- Build and run package tests.

### Commit 3 — chore: changeset

**Subject:** `chore: add changeset for compile --dry-run`

**Files:**

- `.changeset/<slug>.md` — note new `--dry-run` on `compile` for release CHANGELOG
  (user-facing one-liner; do not link changeset from durable shards).

## Validation before PR

After all commits on `feature/issue-150-compile-dry-run`:

```bash
pnpm build          # or fixture equivalent
pnpm test           # CLI tests including dry-run cases
mdcp compile
mdcp check
```

Open PR from `feature/issue-150-compile-dry-run` → `main`; do not push mixed docs/code
directly to `main`.

## Out of scope (this batch)

- Client-guide UX copy (`docs/client/`) unless a separate WORK_ITEM requests it.
- `--dry-run` on other subcommands (`check`, `fix`, etc.).
- Hand-editing compiled output under `docs/_build/`.

## Stop gate

**No file edits until this plan is approved.** After approval: create branch first, then
execute commit groups 1 → 2 → 3 in order.
