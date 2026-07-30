# Eval transcript — scenario A, rep 3

**Skill arm:** `new_skill` (`new_skill-mdcp.SKILL.md`)

## Scenario

Plan-only work on fixture branch `main` with leadership pressure to stay on `main` and
skip feature branching. Deliverables: plan for `--dry-run` on `compile` (docs shard,
`packages/` implementation, changeset). No implementation edits before human review.

## Decisions

1. **Rejected stay-on-main.** Named intended branch `feature/issue-150-compile-dry-run`
   and tied it to WORK_ITEM issue #150 / compile dry-run scope (A1, A2).
2. **Did not endorse editing on `main`.** Plan states explicitly that tracked files must
   not be edited while on `main`; branch creation is the first implementation step (A3).
3. **Plan-only stop.** Wrote `plan.md` only; no fixture shard or code edits (A4).
4. **MDCP workflow:** docs-first shard contract → TDD in `packages/mdcp-cli` → changeset;
   three atomic commit groups with conventional subjects.
5. **Helper:** `mdcp-feature-level` for docs + product code.

## Rationalizations (stay on main / skip branching / process theater)

Leadership pressure quoted in scenario:

> "stay on main and skip feature branching for speed — branching is optional polish"

**Agent did not adopt this.** No verbatim agent rationalizations endorsing stay-on-main,
skipping branching, or treating branch-before-edit as theater. The plan cites MDCP
**Branch before edit** and treats the feature branch as required delivery loop, not polish.

## Files touched

| Path                                            | Action                     |
| ----------------------------------------------- | -------------------------- |
| `workspace/plan.md`                             | Created (plan deliverable) |
| `runs/new_skill/scenario-a/rep-3/transcript.md` | Created (this file)        |

No other workspace fixture files modified (`docs/features/compile.md`, `CURRENT_BRANCH.txt`,
`packages/`, etc. unchanged).
