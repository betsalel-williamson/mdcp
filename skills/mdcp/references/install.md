# Install the MDCP skill pack

## Parent skill

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

That copies the skill into your repo under `.agents/skills/mdcp/` (the install
target).

Zero-install: copy the `mdcp` skill folder into
`.agents/skills/mdcp/` in your repository.

Prefer `.agents/skills/` as the portable install path. Some hosts also discover
`.github/skills/` or `.claude/skills/`.

## After install

The `mdcp` parent skill includes core subagents under
`.agents/skills/mdcp/agents/` after install.

Start a bootstrap session with a natural-language turn under the parent skill:

```text
/mdcp help me get started
```

That loads the `getting-started` subagent. The agent asks for `FEATURE` and
`PERSONA` before installing or writing shards. For other task types, see
[agents.md](agents.md).

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
