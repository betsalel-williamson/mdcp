# `mdcp-ux` live evals

Fixtures and prompts for the optional [skill-creator](../../../../.agents/skills/skill-creator/SKILL.md) loop against the UX / client-guide helper. Not a CI gate.

Parent suite: [`tests/skills/mdcp/evals/`](../../mdcp/evals/README.md). Maintainer index: [`docs/developer/live-skill-evals.md`](../../../../docs/developer/live-skill-evals.md).

## Layout

| Path                                          | Purpose                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `evals.json`                                  | Prompts, `expected_output`, and named `assertions` for client-guide UX |
| `files/fixture-client-guide/`                 | Onboarding persona guide + wrong-tier features bait                    |
| `files/fixture-stale-architecture-in-client/` | Seeded architecture dump in a client shard                             |
| `files/fixture-decoy-paths/`                  | Client settings + developer/features/source decoys                     |

Dogfood repos may map persona guides to other names (`client-cli`, `client-core`) via config — out of scope for these fixtures, which teach the protocol path `docs/client/`.

## What the suite covers

1. **Client guide update** — primary durable edits under `docs/client/` + index; persona outcome prose
2. **Strip architecture from client** — remove `PIPELINE_STAGE_MARKER` / `pkg/export-compiler` / maintainer rebuild dump
3. **Avoid decoy paths** — do not “helpfully” edit `packages/`, `docs/features/`, or developer checklists

## Predicted discrimination (before iteration-1)

| Eval                  | Primary discriminator          | Without skill (expected)                     | With skill (expected)         |
| --------------------- | ------------------------------ | -------------------------------------------- | ----------------------------- |
| 1 Client guide update | `primary_edits_under_client`   | May edit features bait or dump internals     | Client-primary, outcome focus |
| 2 Strip architecture  | `architecture_markers_removed` | Leaves markers or relocates dump to features | Markers gone; client-only     |
| 3 Avoid decoy paths   | `decoy_settings_ts_unchanged`  | Edits settings.ts and/or settings-engine     | Client-only alignment         |

Update this table with **observed** results after live runs (commit 2b). Acceptance requires ≥1 without-fail / with-pass assertion per eval.

## Run path (skill-creator)

1. Ensure `.agents/skills/skill-creator/` is present (vendored in this repo).
2. Load subject skill from `skills/mdcp-ux/` (parent `mdcp` may also be available as prerequisite context on **with_skill** arms only).
3. Copy the listed `files` into an isolated working tree per run (do not edit this monorepo’s real `docs/`).
4. Spawn **with_skill** and **without_skill** baselines together. Do **not** load mdcp-ux / parent routing into without_skill arms.
5. Write results under `.agents/skills/mdcp-ux-workspace/iteration-N/` (gitignored via `*-workspace/`).

```text
.agents/skills/mdcp-ux-workspace/
  iteration-1/
    eval-1-client-guide-update/
      eval_metadata.json
      with_skill/outputs/
      without_skill/outputs/
    eval-2-strip-architecture/
    eval-3-avoid-decoy-paths/
    benchmark.json
```

6. Grade both arms against the same assertions (path/diff scripts for markers and decoys; grader judgment for outcome prose); aggregate; open the viewer (`eval-viewer/generate_review.py`, use `--static` when headless).
7. If skill body fixes are needed, edit `skills/mdcp-ux/SKILL.md` then sync to `.agents/skills/mdcp-ux/`.

Live runs are local-only (not a CI gate). Workspace artifacts stay under `.agents/skills/mdcp-ux-workspace/`.
