# Agent integration

Wire **`@bwilliamson/mdcp-cli`** into any coding agent with npm scripts. This is CLI packaging — not the Agent Skill. For skill install, see [Agent Skill (related)](./agent-skill.md) or the [root README](../../README.md). For how skill subagents use these commands, see [LLM collaboration](./llm-collaboration.md).

Add npm scripts in your consumer repo:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --docs-root docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint",
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --docs-root docs"
  }
}
```

```bash
# Compact context for feature work
mdcp export --llm --stdout --config docs/mdcp.config.json

# Discover shards with host search (rg, IDE search), then validate links
mdcp check --require-lint

# Optional: inspect registry headings after compile or check
mdcp refs list
```

## Related packages

| Package                                                                                | Use                                                         |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`@bwilliamson/mdcp-core`](https://www.npmjs.com/package/@bwilliamson/mdcp-core)       | Programmatic compile, refs, and validation API              |
| [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) | Starter markdownlint configs for shards and compiled output |

## Further reading

- [Project README](../../README.md) — Agent Skill landing (separate from this CLI)
- [Why mdcp for coding agents](./why-mdcp-for-agents.md) — developer pain and which CLI commands address it
- [LLM collaboration](./llm-collaboration.md) — skill + CLI workflow for agents
- [Agent Skill (related)](./agent-skill.md) — optional skill install alongside this package
- [Feature catalog](../features/feature-catalog.md) — full maintainer docs
- [Sample guides](../../examples/sample-guides/)

## License

MIT
