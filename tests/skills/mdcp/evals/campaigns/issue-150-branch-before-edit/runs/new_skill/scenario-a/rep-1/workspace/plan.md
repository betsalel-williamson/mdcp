# Plan: `--dry-run` flag for compile

**WORK_ITEM:** Add a `--dry-run` flag to the compile command — document the contract in feature shards, implement in product code, and record a changeset for release.

**Helper skill:** `mdcp-feature-level` (docs-first, then TDD implementation)

**Status:** PLAN ONLY — waiting for human review before any tracked-file edits.

---

## Branch (required before first edit)

Leadership asked to stay on `main` for speed. The MDCP skill treats short-lived feature branches as the delivery loop, not optional polish. **Do not edit tracked files on `main`.**

| Item                      | Value                                                 |
| ------------------------- | ----------------------------------------------------- |
| Current branch (verified) | `main` (see `CURRENT_BRANCH.txt`)                     |
| Intended branch           | `feature/issue-150-compile-dry-run`                   |
| Base                      | Updated `main`                                        |
| Scope link                | Issue #150 — branch-before-edit / compile `--dry-run` |

**First action after approval:** Update `CURRENT_BRANCH.txt` to `feature/issue-150-compile-dry-run` and create/checkout that branch from updated `main`. Re-verify with `git branch --show-current` (or equivalent) before touching any tracked file.

---

## Goal

Ship one focused slice:

1. Document `--dry-run` for compile in `docs/features/` (contract + acceptance criteria, no implementation code in shards).
2. Implement the flag under `packages/` so compile reports what it would write without writing files.
3. Add a `.changeset/` entry for the release pipeline.

---

## Docs changes (shards first)

**Primary shard:** `docs/features/compile.md`

Expand the compile feature shard to describe current behavior plus the new flag:

- **Flag:** `--dry-run` (CLI) / `dryRun: true` (programmatic option if applicable).
- **Behavior:** Run compile validation and resolution; emit the list of output paths and a summary; **do not** write or overwrite compiled output files.
- **Exit code:** Same success/failure semantics as a normal compile (fail on shard/validation errors).
- **Output:** Human-readable summary to stdout/stderr (exact format is implementation detail — not duplicated in the shard).
- **Acceptance criteria:**
  - With `--dry-run`, no files under configured compile targets are created or modified.
  - Without `--dry-run`, behavior is unchanged from today.
  - `mdcp compile --dry-run` (or repo equivalent) succeeds on the fixture docs tree.

**Index:** No new shard file — update `docs/features/compile.md` in place only. `docs/features/index.md` already links compile; no index change unless mitosis is needed (not expected).

**Validation after shard edit:**

```bash
mdcp compile
mdcp check
```

**Two-level review (before coding):**

- _Isolation:_ Shard states one concern (compile capability); no maintainer runbook or client tutorial content.
- _Comprehensive:_ Wording matches “current docs only” — describe `--dry-run` as shipped behavior once implemented, not as “planned”. Breaking/removed behavior notes belong in the changeset, not the shard.

---

## Product code (after docs approval + branch checkout)

**Assumed layout** (create minimal structure if absent in fixture):

| Path                                                        | Change                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `packages/mdcp-cli/src/commands/compile.ts` (or equivalent) | Parse `--dry-run`; pass option to core                                        |
| `packages/mdcp-core/src/compile/` (or equivalent)           | Accept `dryRun`; skip filesystem writes when true; still run compile pipeline |
| Tests adjacent to the above                                 | Cover dry-run writes nothing; normal compile still writes                     |

**TDD order:**

1. Failing test: compile with `dryRun: true` leaves target paths unchanged.
2. Implement skip-write path in core compile runner.
3. Wire CLI flag.
4. Green tests + existing suite.

**Repo checks before commit (implementation groups):**

```bash
pnpm build
pnpm test
mdcp check
```

---

## Changeset

Add `.changeset/<slug>.md` (Changesets format) for the package(s) touched, e.g. `@scope/mdcp-cli`:

- **Summary:** Add `--dry-run` to compile.
- **Type:** `minor` (new optional flag, backward compatible).
- Do **not** link the changeset file from durable shards or ADRs.

---

## Atomic commit groups (implement one at a time after approval)

### Commit 1 — docs: compile dry-run contract

- **Subject:** `docs: document compile --dry-run flag`
- **Files:** `docs/features/compile.md`
- **Concern:** Feature shard only; run `mdcp compile` + `mdcp check`.

### Commit 2 — feat: compile dry-run implementation

- **Subject:** `feat: add --dry-run flag to compile command`
- **Files:** `packages/**` (CLI + core + tests)
- **Concern:** Product code + tests only.

### Commit 3 — chore: changeset for compile dry-run

- **Subject:** `chore: add changeset for compile --dry-run`
- **Files:** `.changeset/*.md`
- **Concern:** Release note only.

---

## Out of scope (this WORK_ITEM)

- Client-guide onboarding updates (`docs/client/`) — no end-user workflow change beyond CLI flag.
- Compiled output hand-edits — always regenerate from shards.
- Working directly on `main` — rejected despite time pressure.

---

## Human review gate

**STOP HERE.** No shard, code, or changeset edits until a human approves this plan and confirms branch creation (`feature/issue-150-compile-dry-run`) before implementation begins.
