# Live skill evals

Optional local workflow that runs an agent **with** and **without** a subject Agent Skill, grades behavior against named assertions, and reviews results in a viewer. Maintainers use it to tune skill instructions and prove helper scope (for example design-only vs product code).

## What it is not

- **Never a CI gate.** Do not require Claude CLI, skill-creator, or live agent runs in GitHub Actions.
- **Not skill content lint.** [`pnpm skill:lint`](../glossary/skill-content-lint.md) only checks phrases and frontmatter on disk; it does not spawn agents.

Contrast: [skill content lint](../glossary/skill-content-lint.md) and `pnpm skill:validate` ([skills-ref](https://agentskills.io/specification)) remain the CI/static skill gates. See [Agent Skill development](../developer/agent-skill.md).

## Tooling

| Piece                                                                                                    | Role                                                             |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Vendored [skill-creator](../../.agents/skills/skill-creator/SKILL.md) at `.agents/skills/skill-creator/` | Evaluate loop (prompts → with/without skill → grade → aggregate) |
| `pnpm skill:evals:view`                                                                                  | Open the eval viewer helper script                               |
| `.agents/skills/*-workspace/`                                                                            | Per-iteration run outputs (gitignored via `*-workspace/`)        |

Refresh skill-creator from upstream when needed:

```bash
npx skills add anthropics/skills --skill skill-creator
```

## Suite inventory

Live eval fixtures live under `tests/skills/<skill>/evals/` so publishable packs under `skills/` stay eval-free (`npx skills` / `pnpm skill:validate` only touch `skills/`).

| Suite path                                                                                            | Subject skill          | Workspace (gitignored)                           |
| ----------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------ |
| [`tests/skills/mdcp/evals/`](../../tests/skills/mdcp/evals/README.md)                                 | `mdcp` (parent)        | `.agents/skills/mdcp-workspace/`                 |
| [`tests/skills/mdcp-getting-started/evals/`](../../tests/skills/mdcp-getting-started/evals/README.md) | `mdcp-getting-started` | `.agents/skills/mdcp-getting-started-workspace/` |
| [`tests/skills/mdcp-doc-only/evals/`](../../tests/skills/mdcp-doc-only/evals/README.md)               | `mdcp-doc-only`        | `.agents/skills/mdcp-doc-only-workspace/`        |

Each suite README holds operational run steps and discrimination notes. This shard is the product index.

## Layout contract

Shared shape for helper suites:

| Path                                         | Purpose                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `evals/evals.json`                           | `skill_name`, prompts, `expected_output`, `files[]`, named `assertions[{name,description}]` |
| `evals/files/`                               | Isolated fixture trees copied into a run workspace (do not edit real monorepo `docs/`)      |
| `evals/triggers.json` / `trigger_evals.json` | Optional description-trigger tuning (parent suite)                                          |
| `evals/README.md`                            | How to run and grade that suite                                                             |

Parent Agent Skill delivery (install, vendoring, QA principles) stays in [Agent Skill](./agent-skill.md). Helper intake and write obligations stay in [Agent helper skills](./protocol/agent-task-prompts.md).
