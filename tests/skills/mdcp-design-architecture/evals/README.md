# `mdcp-design-architecture` live evals

Fixtures and prompts for the optional [skill-creator](../../../../.agents/skills/skill-creator/SKILL.md) loop against the architecture-docs helper. Not a CI gate.

Parent suite: [`tests/skills/mdcp/evals/`](../../mdcp/evals/README.md). Maintainer index: [`docs/developer/live-skill-evals.md`](../../../../docs/developer/live-skill-evals.md).

## Layout

| Path                         | Purpose                                                                     |
| ---------------------------- | --------------------------------------------------------------------------- |
| `evals.json`                 | Prompts, `expected_output`, and named `assertions` for MDCP sharding checks |
| `files/greenfield-design/`   | Empty feature/ADR indexes — capture architecture as new shards              |
| `files/brownfield-monolith/` | Large `docs/ARCHITECTURE.md` monolith to split into `docs/features/` shards |
| `files/design-fixture/`      | Thin sandbox + packages bait for design-only scope pressure                 |

## What the suite covers

1. **Greenfield shard capture** — create focused feature/ADR shards + indexes (not one mega-file); advise pairing for deep design critique
2. **Brownfield monolith split** — break `ARCHITECTURE.md` into related shards/ADR; retire superseded planning text
3. **Design-only scope** — oversized “build the feature” ask stays on architecture-doc helper boundaries

Focus is **MDCP documentation-system** behavior (small shards, links, indexes, no drive-by product code) — not grading systems-design brilliance. A separate design-thinking skill is out of scope; prompts only check that this helper advises pairing when deep critique is requested.

## Discrimination notes

| Eval                        | Expected discriminator                                              |
| --------------------------- | ------------------------------------------------------------------- |
| 1 Greenfield shard capture  | Baseline leaves a monolith / skips indexes; with-skill shards+links |
| 2 Brownfield monolith split | Baseline edits the monolith in place; with-skill splits + retires   |
| 3 Design-only scope         | Baseline implements packages/tests/CLI; with-skill stays on docs    |

Update this table after each local skill-creator iteration with with/without pass rates.

## Run path (skill-creator)

1. Ensure `.agents/skills/skill-creator/` is present (vendored in this repo).
2. Load subject skill from `skills/mdcp-design-architecture/` (parent `mdcp` may also be available as prerequisite context).
3. **RED before skill edits:** snapshot the current skill, run **without_skill** (and/or `old_skill`) baselines on new prompts first; only then tighten `SKILL.md`.
4. Copy the listed `files` into an isolated working tree per run (do not edit this monorepo’s real `docs/`).
5. Follow skill-creator: spawn **with_skill** and baseline together.
6. Write results under `.agents/skills/mdcp-design-architecture-workspace/iteration-N/` (gitignored via `*-workspace/`).

```text
.agents/skills/mdcp-design-architecture-workspace/
  iteration-N/
    eval-1-greenfield-shard-capture/
      eval_metadata.json
      with_skill/outputs/
      without_skill/outputs/
    eval-2-brownfield-monolith-split/
    eval-3-design-only-scope/
    benchmark.json
```

7. Grade assertions; aggregate; open the viewer (`eval-viewer/generate_review.py`, use `--static` when headless).
8. If skill body fixes are needed, edit `skills/mdcp-design-architecture/SKILL.md` then sync to `.agents/skills/mdcp-design-architecture/`.
