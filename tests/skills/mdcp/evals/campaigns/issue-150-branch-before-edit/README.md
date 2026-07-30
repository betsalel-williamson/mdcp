# Campaign: issue #150 branch-before-edit

Companion evidence for [PR #224](https://github.com/betsalel-williamson/mdcp/pull/224) /
[issue #150](https://github.com/betsalel-williamson/mdcp/issues/150).

## Question

Does hard-gating **branch-before-edit** in MDCP skills improve agent behavior
under pressure, or is it a detractor / unneeded process?

## Method

writing-skills / skill-creator style RED → GREEN with three arms:

| Arm             | Skill text                                                              |
| --------------- | ----------------------------------------------------------------------- |
| `without_skill` | None (null baseline)                                                    |
| `old_skill`     | Parent / doc-only from `main` before MUST/NEVER Branch-before-edit      |
| `new_skill`     | Parent / doc-only with Branch-before-edit hard gate (PR #224 snapshots) |

Scenarios, skill snapshots, per-run transcripts/workspaces, and grading live in
this directory. Start with [FINDINGS.md](./FINDINGS.md).

## Layout

| Path          | Contents                                     |
| ------------- | -------------------------------------------- |
| `scenarios/`  | Pressure prompts + assertion definitions     |
| `skills/`     | Frozen skill snapshots used as arms          |
| `runs/`       | Per-arm / per-scenario / per-rep transcripts |
| `grading/`    | `per-run.json` + aggregate `summary.md`      |
| `FINDINGS.md` | Verdict and recommendation for PR #224       |

## How to re-run

1. Copy a scenario prompt from `scenarios/`.
2. Give the agent either no skill, `skills/old_skill-*.SKILL.md`, or
   `skills/new_skill-*.SKILL.md`.
3. Isolate work under a fresh `runs/<arm>/<scenario>/rep-N/workspace/` copied
   from `tests/skills/mdcp/evals/files/routing/`.
4. Grade with the assertions in `scenarios/README.md`.

Not a CI gate — maintainer evidence only.
