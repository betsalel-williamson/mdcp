# `mdcp-feature-level` live evals

Fixtures and prompts for the optional [skill-creator](../../../../.agents/skills/skill-creator/SKILL.md) loop against the feature-engineering helper. Not a CI gate.

Parent suite: [`tests/skills/mdcp/evals/`](../../mdcp/evals/README.md). Maintainer index: [`docs/developer/live-skill-evals.md`](../../../../docs/developer/live-skill-evals.md).

## Layout

| Path                     | Purpose                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| `evals.json`             | Prompts, `expected_output`, and named `assertions` for docs-first delivery  |
| `files/feature-fixture/` | Tiny MDCP sandbox with `features/` + `client/` tiers and a real `packages/` |

## What the suite covers

1. **Wrong-tier placement (live skill evals)** — documenting the maintainer
   skill-creator runbook must land in `docs/developer/`, **not**
   `docs/features/live-skill-evals.md` (and not invent a `docs/client/` shard),
   even when the topic accompanies `docs/features/skills.md`.
2. **User-facing backfill** — a `--format=csv` option must backfill BOTH
   `docs/features/` and `docs/client/` (with index updates), not be buried in
   `docs/developer/`.

## Red → green (eval 1)

This suite demos the real failure from the live session: a maintainer-only
**live skill evals** runbook was added under `docs/features/` because the helper
skill's Step 3 always said "update `docs/features/` and `docs/client/`".

| Arm                 | Skill                          | Outcome                                                                                       |
| ------------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| `iteration-4-red`   | `0.5.0` (unconditional Step 3) | **FAIL** — created `docs/features/live-skill-evals.md` + `docs/client/live-skill-evals.md`    |
| `iteration-5-green` | `0.5.1` (audience placement)   | **PASS** — created `docs/developer/live-skill-evals.md` only; no features/ or client/ runbook |

Fix in `skills/mdcp-feature-level/SKILL.md`: Step 3 is now **Docs First — place by
audience**, with an explicit maintainer-only → `developer/` row and a placement
test that forbids co-locating live skill-eval runbooks beside product `skills`
shards.

Workspace grading (gitignored): `.agents/skills/mdcp-feature-level-workspace/`.

## Run path (skill-creator)

1. Ensure `.agents/skills/skill-creator/` is present (vendored in this repo).
2. Load subject skill from `skills/mdcp-feature-level/` (parent `mdcp` may also be available as prerequisite context).
3. Copy the listed `files` into an isolated working tree per run (do not edit this monorepo’s real `docs/`).
4. Follow skill-creator: spawn **with_skill** and **without_skill** baselines together.
5. Write results under `.agents/skills/mdcp-feature-level-workspace/iteration-N/` (gitignored via `*-workspace/`).

Live runs are local-only (not a CI gate). Workspace artifacts stay under `.agents/skills/mdcp-feature-level-workspace/` (gitignored).
