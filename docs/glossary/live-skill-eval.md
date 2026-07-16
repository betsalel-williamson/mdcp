# live skill eval

Optional local [skill-creator](../../.agents/skills/skill-creator/SKILL.md) workflow (vendored at `.agents/skills/skill-creator/`): run agents with the skill, grade outputs, and optimize description triggering. Fixtures for that loop live under `skills/mdcp/evals/` (parent) and `skills/mdcp-getting-started/evals/` (bootstrap helper); run outputs go under `.agents/skills/*-workspace/` (gitignored). Never a CI gate in this repository — contrast with [skill content lint](./skill-content-lint.md), which only checks that phrases exist in `SKILL.md`.
