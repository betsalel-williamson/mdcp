# Agent integration

npm script stubs for wiring mdcp into any coding agent. For the portable Agent Skill install (parent + complementary skills), see [Agent Skill (consumer)](./agent-skill.md). For setup prompts, docs-first feature workflow, and task-type templates, see [LLM collaboration](./llm-collaboration.md).

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

- [Agent Skill (consumer)](./agent-skill.md) — host-agnostic skill install
- [Why mdcp for coding agents](./why-mdcp-for-agents.md) — developer pain and which commands address it
- [LLM collaboration](./llm-collaboration.md) — spec-driven workflow, prompts, toolchain integration
- [Project README](../../README.md) — concepts and design rationale
- [Feature catalog](../features/feature-catalog.md) — full maintainer docs
- [Sample guides](../../examples/sample-guides/)

## License

MIT
