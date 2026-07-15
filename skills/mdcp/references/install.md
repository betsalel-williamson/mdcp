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

## After install

The `mdcp` parent skill includes core subagents under
`.agents/skills/mdcp/agents/` after install.

Activate the parent skill with `/mdcp` (hosts that support slash skills), then
name a subagent id (for example `feature-level` or `getting-started`). See
[agents.md](agents.md) for the invoke recipe and catalog.

Optional archetype skills under `skills/mdcp-arch-*` are WIP and are not part of
the consumer install path yet.

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
