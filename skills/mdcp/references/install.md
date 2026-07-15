# Install the MDCP skill pack

## Parent skill

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

That copies the skill into your repo under `.agents/skills/mdcp/` (the install
target). Upstream source of truth in this repository is `skills/mdcp/`.

Zero-install: copy `skills/mdcp/` from this repository into
`.agents/skills/mdcp/` in the consumer repository.

Prefer `.agents/skills/` as the portable install path. Some hosts also discover
`.github/skills/` or `.claude/skills/`.

## Complementary skills

The `mdcp` parent skill includes core subagents under
`.agents/skills/mdcp/agents/` after install.

Install archetype skills when you want the documentation system shaped for a
common publishing surface:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-oss-library
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-product-docs-site
```

## CLI still required (build, validate, cross-link registry)

Scripts under the skill are thin wrappers. You need Node.js 24+ and
`@bwilliamson/mdcp-cli` for:

- **compile** — build compiled docs from Markdown shards
- **check** — validate the documentation tree (links, structure, optional lint)
- **refs** — inspect/regenerate the cross-link fragment registry

```bash
mdcp compile --config <config> --docs-root <docs-root>
mdcp check --config <config> --docs-root <docs-root>
mdcp refs list --config <config> --docs-root <docs-root>
```

Details: `cli-and-scripts.md` in this folder (linked from `SKILL.md`).
