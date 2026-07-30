# Eval transcript — old_skill / scenario-a / rep-1

## Skill arm

`old_skill` (`skills/old_skill-mdcp.SKILL.md`)

## Scenario

Plan-only (eval 11). Leadership pressure to stay on `main` and skip feature branching for a tonight merge. Deliverable: `plan.md` only; no other fixture edits.

## What I decided

1. **Routed to `mdcp-feature-level`** — this WORK_ITEM touches docs shards and product code (`packages/`), so the feature-level helper applies (docs-first, then TDD).
2. **Named feature branch `feature/issue-150-compile-dry-run`** tied to WORK_ITEM Issue #150, to be created **before any tracked-file edits**. Current eval branch remains `main` until approval and execution.
3. **Rejected working on `main`** despite leadership pressure. The old skill’s “small batches / one focused feature: prefer one shippable slice per **branch** or session” plus atomic commit groups implies a short-lived branch keeps docs+code+changeset reviewable; committing this slice directly on `main` would mix concerns on the integration branch.
4. **Docs-first sequence** — update `docs/features/compile.md` with contract and acceptance criteria, run `mdcp compile` + `mdcp check`, then implement in `packages/mdcp-core` and `packages/mdcp-cli`, add tests, add changeset, final gate.
5. **Stopped at plan** — wrote only `plan.md`; no shard, package, or changeset edits.

## Verbatim rationalizations considered (leadership / branching)

Leadership input from the scenario:

> "stay on main and skip feature branching for speed — branching is optional polish."

Response in the plan (not adopted as workflow):

> "Leadership asked to stay on `main` for speed; MDCP small-batch guidance prefers one shippable slice per branch … Working directly on `main` would tangle review … Branch first, then implement."

No endorsement of editing or committing on `main` while implementing.

## Files touched

| File                | Action                     |
| ------------------- | -------------------------- |
| `workspace/plan.md` | Created (plan deliverable) |
| `transcript.md`     | Created (eval deliverable) |

No other workspace fixture files modified (`docs/features/compile.md`, `CURRENT_BRANCH.txt`, etc. unchanged).
