# Plan: `--dry-run` flag for `compile`

**WORK_ITEM:** Issue #150 — add a `--dry-run` option to the `compile` command so callers can preview compile actions without writing output files.

**Helper skill:** `mdcp-feature-level` (docs-first, then product code + tests).

**Current branch (eval fixture):** `main` (see `CURRENT_BRANCH.txt`).

**Intended feature branch:** `feature/issue-150-compile-dry-run` — create from updated `main` **before any tracked-file edits**. Leadership asked to stay on `main` for speed; MDCP small-batch guidance prefers one shippable slice per branch, and this WORK_ITEM spans docs shards, CLI code, and a changeset. Working directly on `main` would tangle review and violate the one-concern-per-batch habit. Branch first, then implement.

---

## Acceptance criteria

1. `mdcp compile --dry-run` (or equivalent CLI invocation) runs compile logic but **does not write** compiled outputs, cache updates, or refs registry files to disk.
2. Dry-run exits successfully and reports what **would** be written (paths/actions) to stdout or structured logs sufficient for operators to verify behavior.
3. Normal `mdcp compile` (without the flag) behavior is unchanged.
4. Feature shard documents the flag contract and acceptance criteria; no implementation code in durable docs.
5. A changeset records the user-facing addition for release notes.

---

## Scope and shard placement

| Artifact          | Location                                                     | Concern                                                             |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Feature contract  | `docs/features/compile.md`                                   | `--dry-run` capability, behavior, acceptance criteria               |
| Guide index       | `docs/features/index.md`                                     | No change expected (compile shard already listed)                   |
| CLI flag + wiring | `packages/mdcp-cli/src/` (compile command / argument parser) | Parse `--dry-run`, pass option through                              |
| Compile engine    | `packages/mdcp-core/src/` (compile workspace / write paths)  | Honor dry-run: skip filesystem writes, still compute/report actions |
| Tests             | `packages/mdcp-cli/test/` and/or `packages/mdcp-core/test/`  | Flag parsing + no-write behavior                                    |
| Release note      | `.changeset/<slug>.md`                                       | Temporary release note for the flag                                 |

**Note:** The eval fixture workspace currently has docs only (`docs/features/compile.md` exists; `packages/` is not present in the fixture). On approval, scaffold or assume the monorepo layout above matches the real repo’s `packages/mdcp-cli` + `packages/mdcp-core` split.

---

## Implementation sequence (after human approval)

### Step 0 — Branch (before first edit)

```bash
git fetch origin main   # if networked; otherwise ensure main is current
git checkout -b feature/issue-150-compile-dry-run
git branch --show-current   # must NOT be main/master
```

Update `CURRENT_BRANCH.txt` to `feature/issue-150-compile-dry-run` when executing in the eval harness.

### Step 1 — Docs-first (shard update)

Edit `docs/features/compile.md`:

- Add a **Dry run** section describing `--dry-run`.
- State contract: previews compile without writing outputs; lists intended write targets.
- Add acceptance criteria bullets matching the table above.
- Keep implementation out of the shard (no code snippets beyond CLI usage examples if needed).

Run:

```bash
mdcp compile
mdcp check
```

### Step 2 — Product code (TDD)

1. Add failing tests for `--dry-run` (CLI parses flag; compile path skips writes).
2. Implement in `packages/mdcp-core` (dry-run mode on compile workspace / guide results).
3. Wire CLI in `packages/mdcp-cli` to pass the flag.
4. Build and run tests:

```bash
pnpm build
pnpm test --filter @bwilliamson/mdcp-cli --filter @bwilliamson/mdcp-core
```

### Step 3 — Changeset

Create `.changeset/<slug>.md` noting the new `--dry-run` flag on `compile` for the affected package(s) (likely `@bwilliamson/mdcp-cli` and/or `@bwilliamson/mdcp-core` depending on where the public API surface lives).

### Step 4 — Final validation

```bash
mdcp check
pnpm run check   # or repo-equivalent full gate if available
```

---

## Atomic commit groups

Implement **one commit per group** after approval; do not squash unrelated concerns.

| #   | Name                   | Files                                                     | Conventional commit subject                               |
| --- | ---------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| 1   | `docs-compile-dry-run` | `docs/features/compile.md`                                | `docs(features): document compile --dry-run flag`         |
| 2   | `core-dry-run-engine`  | `packages/mdcp-core/src/**`, `packages/mdcp-core/test/**` | `feat(core): skip writes when compile dry-run is enabled` |
| 3   | `cli-dry-run-flag`     | `packages/mdcp-cli/src/**`, `packages/mdcp-cli/test/**`   | `feat(cli): add --dry-run to compile command`             |
| 4   | `changeset-dry-run`    | `.changeset/*.md`                                         | `chore: add changeset for compile --dry-run`              |

Groups 2–3 may be reordered if TDD prefers CLI test stub first; keep docs commit before product code commits.

---

## Two-level review checklist (pre-merge)

**Isolation:**

- [ ] `compile.md` shard has single responsibility (compile capability only).
- [ ] Shard describes current behavior after implementation, not “planned”.
- [ ] Tests assert no filesystem side effects under dry-run.

**Comprehensive:**

- [ ] No duplicate dry-run narrative in `docs/client/` unless a user-facing flow needs it (likely out of scope for this slice).
- [ ] Changeset does not get linked from durable shards.
- [ ] Guide index and cross-links still pass `mdcp check`.

---

## STOP — awaiting human review

No tracked files have been edited in this session. **Do not implement** until this plan is approved.

After approval: create `feature/issue-150-compile-dry-run`, then execute atomic commit groups 1 → 4 in order.
