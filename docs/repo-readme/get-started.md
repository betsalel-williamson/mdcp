# Get started

Install MDCP when you want a **documentation system** your agents will actually follow — sharded Markdown, compile/check in CI, and less effort keeping docs honest as ideas arrive. Use the [`skills` CLI](https://www.skills.sh/docs/cli) (same path as [skills.sh](https://skills.sh)).

## Quick Start

Install the core documentation-system Agent Skill into your repository:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

_(This copies the skill into your agent's skills directory (chosen by the [`skills` CLI](https://www.skills.sh/docs/cli) via `--agent` or auto-detect). Commit it to git so every teammate and agent shares the same documentation discipline. Per-agent paths: [Supported Agents](https://github.com/vercel-labs/skills#supported-agents).)_

Then start a bootstrap session:

```text
/mdcp help me get started
```

The agent asks for `FEATURE` and `PERSONA`, then helps wire config, guide layout, and validation. After bootstrap, it can walk an optional **first feature** through design → feature → UX → doc-only (recommended example or your own). Once the pipeline exists, agents proactively look up shard context, compile documentation, and validate references before writing code.
