# Parent `mdcp` live evals

Fixtures and prompts for the optional [skill-creator](../../../.agents/skills/skill-creator/SKILL.md) loop. Not a CI gate.

## Layout

| Path                                   | Purpose                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| `evals.json`                           | Prompts + `expected_output` (add `expectations` after first with-skill runs) |
| `files/hygiene/`                       | Stale backlog + code-in-docs anti-patterns (eval 7)                          |
| `files/routing/`                       | Minimal guides so helper routing is observable (evals 8–9)                   |
| `triggers.json` / `trigger_evals.json` | Description-trigger tuning only                                              |

## Run path (skill-creator)

1. Ensure `.agents/skills/skill-creator/` is present (vendored in this repo).
2. Dogfood the parent skill: `pnpm skill:install` → `.agents/skills/mdcp/`.
3. Follow skill-creator: prompts first, then spawn **with-skill** and **without_skill** baselines together.
4. Write results under `.agents/skills/mdcp-workspace/iteration-N/` (gitignored via `*-workspace/`).

```text
.agents/skills/mdcp-workspace/
  iteration-1/
    eval-6-small-batches/
      eval_metadata.json
      with_skill/outputs/
      without_skill/outputs/
    eval-7-hygiene-stale-code/
    eval-8-route-client-ux/
    eval-9-route-design-adr/
    benchmark.json
```

5. Draft objectively verifiable `expectations` while runs progress; grade; aggregate; open the viewer (`eval-viewer/generate_review.py`, use `--static` when headless).

Child-skill suite for bootstrap: [`tests/skills/mdcp-getting-started/evals/`](../../mdcp-getting-started/evals/README.md). Other helpers remain separate issues.
