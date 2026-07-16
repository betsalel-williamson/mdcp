# `mdcp-getting-started` live evals

Fixtures and prompts for the optional [skill-creator](../../../.agents/skills/skill-creator/SKILL.md) loop against the getting-started helper. Not a CI gate.

Parent suite: [`skills/mdcp/evals/`](../../mdcp/evals/README.md).

## Layout

| Path                     | Purpose                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| `evals.json`             | Prompts, `expected_output`, and named `assertions` for bootstrap checks |
| `files/greenfield-npm/`  | Empty npm project (no docs root) — evals 1 and 3                        |
| `files/greenfield-pnpm/` | Empty pnpm project (no docs root) — eval 2                              |

## What the suite covers

1. **Greenfield npm bootstrap** — docs root, `mdcp.config.json`, four-tier guides, persona, compile/check
2. **pnpm discovery** — prefer the fixture’s package manager, same success path
3. **Intake skip + glossary seed** — FEATURE/PERSONA already given; add a glossary term; validate

## Run path (skill-creator)

1. Ensure `.agents/skills/skill-creator/` is present (vendored in this repo).
2. Load subject skill from `skills/mdcp-getting-started/` (parent `mdcp` may also be available as prerequisite context).
3. Copy the listed `files` into an isolated working tree per run (do not bootstrap inside this monorepo’s real `docs/`).
4. Follow skill-creator: spawn **with_skill** and **without_skill** baselines together.
5. Write results under `.agents/skills/mdcp-getting-started-workspace/iteration-N/` (gitignored via `*-workspace/`).

```text
.agents/skills/mdcp-getting-started-workspace/
  iteration-1/
    eval-1-greenfield-npm/
      eval_metadata.json
      with_skill/outputs/
      without_skill/outputs/
    eval-2-greenfield-pnpm/
    eval-3-intake-glossary/
    benchmark.json
```

6. Grade assertions; aggregate; open the viewer (`eval-viewer/generate_review.py`, use `--static` when headless).
7. If skill body fixes are needed, edit `skills/mdcp-getting-started/SKILL.md` then sync to `.agents/skills/mdcp-getting-started/`.
