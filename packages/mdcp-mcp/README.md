# @bwilliamson/mdcp-mcp

MDCP **MCP delivery** package — merge-gate review tools and future Model Context Protocol server.

Separate from `@bwilliamson/mdcp-core` and `@bwilliamson/mdcp-cli` (MarkDown Context Protocol authoring). This package evolves toward [V2 MCP delivery](https://github.com/betsalel-williamson/mdcp/issues/59).

## Commands

| Command                                | Purpose                           |
| -------------------------------------- | --------------------------------- |
| `mdcp-mcp tools`                       | JSON tool descriptors (MCP-light) |
| `mdcp-mcp call <tool> --args '{}'`     | Invoke one tool                   |
| `mdcp-mcp brief [--pr N]`              | Review brief for offline agents   |
| `mdcp-mcp run [--pr N] [--agent]`      | Merge gate orchestrator           |
| `mdcp-mcp submit --findings file.json` | Post agent findings to PR         |

## Development

Build MCP servers using upstream skills in `.agents/skills/` (`mcp-builder`, `build-mcp-server`) — not in `skills/` (MDCP-only).

```bash
pnpm --filter @bwilliamson/mdcp-mcp build
pnpm --filter @bwilliamson/mdcp-mcp test
```

See [docs/developer/mdcp-mcp-merge-gate.md](../../docs/developer/mdcp-mcp-merge-gate.md) (compiled into DEVELOPERS.md).
