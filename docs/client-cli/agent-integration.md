# Agent integration

Wire **`@bwilliamson/mdcp-cli`** into CI or coding agents with npm scripts. This is CLI packaging — not the Agent Skill ([root README](../../README.md)).

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --docs-root docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint"
  }
}
```

```bash
mdcp check --require-lint
mdcp refs-list
mdcp evaluate-doc-coverage --git --mode advisory --config docs/mdcp.config.json --docs-root docs
```

Use `evaluate-doc-coverage` in PR automations to detect missing shards before merge. Keep the host thin: collect paths, run the CLI, route on `status`. Details: [Evaluate doc coverage](./evaluate-doc-coverage.md).

## Related packages

| Package                                                                                | Use                                                         |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`@bwilliamson/mdcp-core`](https://www.npmjs.com/package/@bwilliamson/mdcp-core)       | Programmatic compile, refs, and validation API              |
| [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) | Starter markdownlint configs for shards and compiled output |

## Further reading

- [Project README](../../README.md) — Agent Skill landing
- [Commands reference](./commands-reference.md) — full `mdcp` command list
- [Core API](../client-core/index.md) — programmatic library
- [Feature catalog](../features/feature-catalog.md) — maintainer depth
- [Sample guides](../../examples/sample-guides/)

## License

MIT
