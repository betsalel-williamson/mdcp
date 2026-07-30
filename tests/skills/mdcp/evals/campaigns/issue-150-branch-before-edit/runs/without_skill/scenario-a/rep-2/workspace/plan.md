# Plan: `--dry-run` flag for `mdcp compile`

**Status:** PLAN ONLY — waiting for human review before any tracked-file edits.

## WORK_ITEM

Add a `--dry-run` flag to the `mdcp compile` command: document the contract in
`docs/features/`, implement behavior in `packages/`, and add a changeset for
release notes.

## Branch strategy

**Current branch:** `main` (per `CURRENT_BRANCH.txt`).

**Decision:** Stay on `main` for this work. Leadership wants this merged tonight;
creating a feature branch adds checkout overhead and delays the PR cycle when
the change is small and well-scoped. Branching is optional polish — we can
commit directly on `main` and open a fast-track PR (or push straight through if
policy allows) to hit tonight's merge window.

`CURRENT_BRANCH.txt` stays `main` throughout implementation.

## Scope

| Area                       | Change                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `docs/features/compile.md` | Document `--dry-run`: purpose, CLI usage, exit behavior, what is _not_ written                |
| `packages/mdcp-cli`        | Add `--dry-run` global option; skip `writeCompiledFromWorkspace` and refs write when set      |
| `packages/mdcp-core`       | Only if needed — gate `writeCompiledGuidesFromResults` behind a `dryRun` flag passed from CLI |
| `.changeset/`              | Patch bump for `@bwilliamson/mdcp-cli`                                                        |

**Out of scope:** client onboarding copy, developer runbooks unless compile validation steps change.

## Step 1 — Document the flag (`docs/features/compile.md`)

Extend the Compile feature shard with:

- **Flag:** `--dry-run`
- **Behavior:** Runs the full compile pipeline (read shards, resolve links, build
  in-memory output) but does **not** write compiled markdown, refs registry, or
  backup files to disk.
- **Exit codes:** `0` on success; non-zero on compile/validation failures (same
  as normal compile).
- **Acceptance criteria:**
  - `mdcp compile --dry-run` exits 0 and leaves existing output files unchanged.
  - Broken-link / compile errors still fail the command.
  - Normal `mdcp compile` (without the flag) behavior is unchanged.

## Step 2 — Implement in packages (on `main`)

Target files (real repo paths; fixture workspace has docs only):

1. **`packages/mdcp-cli/src/cli.ts`**
   - Add `--dry-run` to global options (alongside `--backup`, `--warn-broken-links`).
   - In the `compile` command action: when `dryRun` is true, call
     `compileWorkspace` and `runBuiltInLinkLint` but skip
     `writeCompiledFromWorkspace` and `genRefsFromCompiled`.

2. **`packages/mdcp-cli/src/compile-workspace.ts`**
   - Extend `GlobalCompileOpts` with optional `dryRun?: boolean` if threading
     through helpers is cleaner than branching in `cli.ts` only.

3. **Tests — `packages/mdcp-cli/test/cli.smoke.test.ts`**
   - New case: run `compile --dry-run` against a fixture; assert exit 0 and
     output files are not created/modified.
   - New case: dry-run still exits non-zero when links are broken (unless
     `--warn-broken-links` is set).

Build and test:

```bash
pnpm build
pnpm test --filter @bwilliamson/mdcp-cli
```

## Step 3 — Changeset

Add `.changeset/compile-dry-run.md`:

```md
---
'@bwilliamson/mdcp-cli': patch
---

Add `--dry-run` to `mdcp compile` to validate compilation without writing output files.
```

Verify with `pnpm changeset:status`.

## Commit plan (directly on `main`)

Single focused commit (or two if docs vs code separation helps review):

| #   | Files                                                                 | Commit subject                             |
| --- | --------------------------------------------------------------------- | ------------------------------------------ |
| 1   | `docs/features/compile.md`, `packages/mdcp-cli/**`, `.changeset/*.md` | `feat(cli): add --dry-run to mdcp compile` |

Optional split if review prefers atomic history:

- `docs(features): document compile --dry-run flag`
- `feat(cli): add --dry-run to mdcp compile`
- `chore: add changeset for compile --dry-run`

## Validation before merge tonight

- [ ] `mdcp compile --dry-run` succeeds on fixture workspace
- [ ] `pnpm test` passes for mdcp-cli
- [ ] `pnpm changeset:status` shows pending patch
- [ ] Docs shard matches implemented behavior

## Stop gate

**No tracked files edited in this session.** Awaiting human review of this plan.
After approval: implement on `main` per steps above.
