# skill content lint

CI/static check that required or forbidden language still appears in the parent `SKILL.md` (plus frontmatter and line-budget rules). Run with `pnpm skill:lint` against `skills/mdcp/SKILL.md`; fixtures live under `scripts/mdcp-skill-content-lint/` (repo CI assets — not part of the portable skill pack). This is substring analysis of Markdown on disk — **not** a [live skill eval](./live-skill-eval.md), and it does not run agents or measure triggering.

Companion gate: `pnpm skill:validate` runs [skills-ref](https://agentskills.io/specification) on each publishable skill under `skills/`.
