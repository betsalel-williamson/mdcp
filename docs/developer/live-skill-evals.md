# Live skill evals

Optional local workflow that runs an agent **with** and **without** a subject
Agent Skill, grades behavior against named assertions, and reviews results in a
viewer. Maintainers use it to tune skill instructions and prove helper scope
(for example design-only vs product code).

This is **maintainer workflow**, not a product capability — it belongs in the
Developer Guide. Product Agent Skill delivery stays in
[Agent Skill](../features/agent-skill.md).

## What it is not

- **Never a CI gate.** Do not require Claude CLI, skill-creator, or live agent
  runs in GitHub Actions.
- **Not skill content lint.** [`pnpm skill:lint`](../glossary/skill-content-lint.md)
  only checks phrases and frontmatter on disk; it does not spawn agents.

Contrast: [skill content lint](../glossary/skill-content-lint.md) and
`pnpm skill:validate` ([skills-ref](https://agentskills.io/specification)) remain
the CI/static skill gates. See [Agent Skill development](./agent-skill.md).

## Tooling

- **skill-creator** — vendored at
  [`.agents/skills/skill-creator/`](../../.agents/skills/skill-creator/SKILL.md);
  evaluate loop (prompts → with/without skill → grade → aggregate)
- **`pnpm skill:evals:view`** — open the eval viewer helper script
- **`.agents/skills/*-workspace/`** — per-iteration run outputs (gitignored via
  `*-workspace/`)

Refresh skill-creator from upstream when needed:

```bash
npx skills add anthropics/skills --skill skill-creator
```

## Suite inventory

Live eval fixtures live under `tests/skills/<skill>/evals/` so publishable packs
under `skills/` stay eval-free (`npx skills` / `pnpm skill:validate` only touch
`skills/`).

- [mdcp](../../tests/skills/mdcp/evals/README.md) — subject `mdcp`; workspace
  `.agents/skills/mdcp-workspace/`
- [mdcp-getting-started](../../tests/skills/mdcp-getting-started/evals/README.md) —
  subject `mdcp-getting-started`; workspace
  `.agents/skills/mdcp-getting-started-workspace/`
- [mdcp-doc-only](../../tests/skills/mdcp-doc-only/evals/README.md) — subject
  `mdcp-doc-only`; workspace `.agents/skills/mdcp-doc-only-workspace/`
- [mdcp-design-architecture](../../tests/skills/mdcp-design-architecture/evals/README.md) —
  subject `mdcp-design-architecture`; workspace
  `.agents/skills/mdcp-design-architecture-workspace/`
- [mdcp-feature-level](../../tests/skills/mdcp-feature-level/evals/README.md) —
  subject `mdcp-feature-level`; workspace
  `.agents/skills/mdcp-feature-level-workspace/`

Each suite README holds operational run steps and discrimination notes. This
shard is the maintainer index.

## Layout contract

Shared shape for helper suites:

| Path                  | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| `evals/evals.json`    | `skill_name`, prompts, `expected_output`, `files[]`, named `assertions` |
| `evals/files/`        | Isolated fixture trees for run workspaces (not real monorepo `docs/`)   |
| `evals/triggers.json` | Optional description-trigger tuning (parent suite)                      |
| `evals/README.md`     | How to run and grade that suite                                         |

Helper intake and write obligations stay in
[Agent helper skills](../features/protocol/agent-task-prompts.md).
