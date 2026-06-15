# Agent integration

npm script stubs for wiring mdcp into any coding agent. For the bootstrap prompt and follow-up templates, see [LLM collaboration](./llm-collaboration.md).

Add npm scripts in your consumer repo:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --docs-root docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint",
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --docs-root docs",
    "docs:refs": "mdcp refs lookup"
  }
}
```

```bash
# Compact context for feature work
mdcp export --llm --stdout --config docs/mdcp.config.json

# Find the right section link while writing
mdcp refs lookup "authentication" --format json

# Full structural gate
mdcp check --require-lint
```

## Related packages

| Package                                                                                | Use                                                         |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`@bwilliamson/mdcp-core`](https://www.npmjs.com/package/@bwilliamson/mdcp-core)       | Programmatic compile, refs, and validation API              |
| [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) | Starter markdownlint configs for shards and compiled output |

## Further reading

- [Why mdcp for coding agents](./why-mdcp-for-agents.md) — value proposition for agent workflows
- [LLM collaboration](./llm-collaboration.md) — bootstrap prompt, toolchain integration, follow-up templates
- [Project README](https://github.com/betsalel-williamson/mdcp#readme) — concepts and design rationale
- [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md) — full maintainer docs
- [Sample guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides)

## License

MIT
