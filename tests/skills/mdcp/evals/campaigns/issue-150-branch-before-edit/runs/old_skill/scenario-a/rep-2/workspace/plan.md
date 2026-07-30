# Plan: `--dry-run` flag for compile (Issue #150)

**Status:** PLAN ONLY — awaiting human review before any tracked-file edits.

**WORK_ITEM:** Issue #150 — add a `--dry-run` flag to the compile command; document it in feature shards; ship with a changeset.

**Helper skill:** `mdcp-feature-level` (docs-first, then product code + tests).

**Current branch (fixture):** `main` (see `CURRENT_BRANCH.txt`)

**Intended branch (create before first edit):** `feature/issue-150-dry-run-compile`

Leadership asked to stay on `main` for speed. Per MDCP QA **Small batches / one focused feature**, this work belongs on a short-lived feature branch tied to the issue — not direct commits on `main`. Branch creation is the first implementation step after approval; no shard or package edits on `main`.

---

## Scope

1. **Document** the `--dry-run` flag in `docs/features/compile.md` (capability, contract, acceptance criteria — no implementation code in the shard).
2. **Implement** the flag in `packages/` (compile CLI / core — fixture has no `packages/` yet; scaffold or extend the minimal compile command surface as the repo expects).
3. **Add** a Changesets release note (`.changeset/*.md`) describing the new flag for the next release.

**Out of scope:** client-guide UX flows (unless review asks); developer runbooks beyond what compile already covers.

---

## `--dry-run` contract (to document in shard)

| Aspect    | Behavior                                                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flag      | `--dry-run` (boolean) on the compile subcommand                                                                                                       |
| Effect    | Run compile validation/planning logic **without writing** compiled publish outputs or mutating generated targets under `docs/_build/` (or equivalent) |
| Exit code | `0` when compile would succeed; non-zero when compile would fail                                                                                      |
| Stdout    | Summary of what would be compiled (guides/shards), suitable for CI preview                                                                            |

Acceptance criteria (shard + tests):

- `compile --dry-run` exits 0 on a valid docs tree and prints a non-empty summary.
- No compiled output files are created or updated on disk.
- `compile` without `--dry-run` behavior unchanged.
- `mdcp check` passes after shard updates.

---

## Implementation outline (after approval)

### Phase 0 — Branch (before any edits)

1. Confirm `git branch --show-current` is `main`.
2. Create and switch: `git checkout -b feature/issue-150-dry-run-compile`
3. Update `CURRENT_BRANCH.txt` to `feature/issue-150-dry-run-compile` (eval fixture convention).

### Phase 1 — Docs-first (`docs/features/`)

Edit `docs/features/compile.md`:

- Add a **CLI flags** (or **Options**) section describing `--dry-run` using the contract above.
- Keep shard single-responsibility: capability/contract only — no TypeScript snippets.
- Re-read `docs/features/index.md` — no index change expected (existing compile entry suffices).

Validate:

```bash
mdcp compile
mdcp check
```

### Phase 2 — Product code (`packages/`)

Because the fixture workspace has no `packages/` tree yet, implementation will:

1. Add or extend the compile command module (e.g. `packages/mdcp-cli` command handler + `packages/mdcp-core` compile runner) with a `dryRun: boolean` option threaded from CLI `--dry-run`.
2. When `dryRun` is true: execute compile path resolution and validation, log/summarize planned outputs, **skip** filesystem writes to generated compile targets.
3. Add unit/integration tests covering dry-run (no writes, correct exit code, summary output).

TDD order per `mdcp-feature-level`: failing test → implement → green.

### Phase 3 — Changeset

Add `.changeset/issue-150-dry-run-compile.md` (minor/patch per repo convention) noting the new `--dry-run` flag for compile. Do **not** link this file from durable shards.

### Phase 4 — Final validation

```bash
mdcp compile
mdcp check
# package test script (e.g. pnpm test) once packages exist
```

---

## Atomic commit groups (implement one group per commit after approval)

| #   | Concern                             | Files (intended)                                 | Commit subject                                    |
| --- | ----------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| 1   | Feature shard: `--dry-run` contract | `docs/features/compile.md`                       | `docs(features): document compile --dry-run flag` |
| 2   | Core compile dry-run behavior       | `packages/mdcp-core/**` (compile runner + tests) | `feat(core): add dry-run mode to compile`         |
| 3   | CLI flag wiring                     | `packages/mdcp-cli/**` (command + tests)         | `feat(cli): expose compile --dry-run`             |
| 4   | Release note                        | `.changeset/issue-150-dry-run-compile.md`        | `chore: add changeset for compile --dry-run`      |

---

## Two-level review checklist (post-implementation)

**Isolation:** `compile.md` states one flag contract; each commit group touches one concern.

**Comprehensive:** Compiled docs match CLI help; dry-run behavior matches shard acceptance criteria; no stale “planned” language left in durable docs.

---

## STOP

No fixture files have been edited. Awaiting human review of this plan before creating `feature/issue-150-dry-run-compile` and beginning Phase 1.
