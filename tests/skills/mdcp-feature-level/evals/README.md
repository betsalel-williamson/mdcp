# `mdcp-feature-level` live evals

Fixtures and prompts for the optional [skill-creator](../../../../.agents/skills/skill-creator/SKILL.md) loop against the feature-engineering helper. Not a CI gate.

Parent suite: [`tests/skills/mdcp/evals/`](../../mdcp/evals/README.md). Maintainer index: [`docs/developer/live-skill-evals.md`](../../../../docs/developer/live-skill-evals.md).

## Layout

| Path                     | Purpose                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| `evals.json`             | Prompts, `expected_output`, and named `assertions` for docs-first delivery  |
| `files/feature-fixture/` | Tiny MDCP sandbox with `features/` + `client/` tiers and a real `packages/` |

## What the suite covers

1. **Placement by audience** — a maintainer-only skill-eval runbook must land in
   `docs/developer/`, NOT be co-located in `docs/features/` next to the shipped
   `skills` capability, and NOT get a `docs/client/` shard.
2. **User-facing backfill** — a `--format=csv` option must backfill BOTH
   `docs/features/` and `docs/client/` (with index updates), not be buried in
   `docs/developer/`.

## Regression under test

The failures this suite guards against, both observed while authoring the real
live-skill-evals docs:

- **Wrong-tier placement** — a maintainer-only workflow shard landing in
  `docs/features/` (product-capability tier) instead of `docs/developer/`.
- **Under-backfill** — shipping a user-facing feature but leaving the
  `docs/client/` tier (and its `index.md`) stale.

## Discrimination notes (iterations 1–3)

Honest negative result: across three iterations the failure **did not
reproduce**. Both `with_skill` and fully naive `without_skill` baselines
consistently placed the maintainer runbook in `docs/developer/` and dual-tier
backfilled the user-facing feature — even after adding a same-subject
`docs/features/skills.md` to create genuine pull toward co-location.

Conclusion: the wrong-tier placement in the original session was a one-off
execution lapse, not a systematic skill deficiency this suite can surface with
current models. The suite is retained as a **regression guard**, not a
red-to-green demonstration. If a future model regresses on tier placement, these
assertions will catch it. The durable remedy for the ambiguity is the sharpened
three-tier placement guidance (audience + "keep out" + placement test) in the
parent `mdcp` skill and protocol shards.

## Run path (skill-creator)

1. Ensure `.agents/skills/skill-creator/` is present (vendored in this repo).
2. Load subject skill from `skills/mdcp-feature-level/` (parent `mdcp` may also be available as prerequisite context).
3. Copy the listed `files` into an isolated working tree per run (do not edit this monorepo’s real `docs/`).
4. Follow skill-creator: spawn **with_skill** and **without_skill** baselines together.
5. Write results under `.agents/skills/mdcp-feature-level-workspace/iteration-N/` (gitignored via `*-workspace/`).

Live runs are local-only (not a CI gate). Workspace artifacts stay under `.agents/skills/mdcp-feature-level-workspace/` (gitignored).
