# `mdcp-design-architecture` live evals

Fixtures and prompts for the optional [skill-creator](../../../../.agents/skills/skill-creator/SKILL.md) loop against the systems-architecture helper. Not a CI gate.

Parent suite: [`tests/skills/mdcp/evals/`](../../mdcp/evals/README.md). Product index: [`docs/features/live-skill-evals.md`](../../../../docs/features/live-skill-evals.md).

## Layout

| Path                    | Purpose                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `evals.json`            | Prompts, `expected_output`, and named `assertions` for design-scope checks  |
| `files/design-fixture/` | Tiny MDCP sandbox (feature/ADR docs + bait `packages/`) shared across evals |

## What the suite covers

1. **ADR draft** — land a decision under `docs/features/adr/`, update the index, no product code or large impl dumps
2. **Architecture shard update** — revise intent/boundaries; retire superseded planning bullets
3. **Design-only scope** — oversized “build the feature” ask stays on architecture helper boundaries

## Discrimination notes (iteration-1)

| Eval                        | With skill | Without skill | Notes                                                             |
| --------------------------- | ---------- | ------------- | ----------------------------------------------------------------- |
| 1 ADR draft                 | Pass       | Pass          | Weak alone — baseline often drafts ADRs correctly                 |
| 2 Architecture shard update | Pass       | Partial       | Baseline may retain residual `cache-v1` wording after cleanup     |
| 3 Design-only scope         | Pass       | Fail          | Primary discriminator — baseline implements packages/, tests, CLI |

Live runs are local-only (not a CI gate). Workspace artifacts stay under `.agents/skills/mdcp-design-architecture-workspace/` (gitignored).

## Run path (skill-creator)

1. Ensure `.agents/skills/skill-creator/` is present (vendored in this repo).
2. Load subject skill from `skills/mdcp-design-architecture/` (parent `mdcp` may also be available as prerequisite context).
3. Copy the listed `files` into an isolated working tree per run (do not edit this monorepo’s real `docs/`).
4. Follow skill-creator: spawn **with_skill** and **without_skill** baselines together.
5. Write results under `.agents/skills/mdcp-design-architecture-workspace/iteration-N/` (gitignored via `*-workspace/`).

```text
.agents/skills/mdcp-design-architecture-workspace/
  iteration-1/
    eval-1-adr-draft/
      eval_metadata.json
      with_skill/outputs/
      without_skill/outputs/
    eval-2-architecture-shard-update/
    eval-3-design-only-scope/
    benchmark.json
```

6. Grade assertions; aggregate; open the viewer (`eval-viewer/generate_review.py`, use `--static` when headless).
7. If skill body fixes are needed, edit `skills/mdcp-design-architecture/SKILL.md` then sync to `.agents/skills/mdcp-design-architecture/`.
