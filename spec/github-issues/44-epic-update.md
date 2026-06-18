## Add to epic body

### V1/V2/V3 roadmap

| Phase | Delivery                                             | Issue         |
| ----- | ---------------------------------------------------- | ------------- |
| V1    | `mdcp.v1.llms.txt` bootstrap + `export --llms-index` | Phase 1 issue |
| V2    | MCP server (repo-local)                              | V2 issue      |
| V3    | Hosted API + API keys                                | V3 issue      |

First protocol artifact beyond config: **`mdcp.v1.llms.txt`** (protocol `1.0.0.0`).

Vision shard: [docs/features/protocol/00-vision-and-roadmap.md](docs/features/protocol/00-vision-and-roadmap.md)

### Revised child order

1. Phase 1 bootstrap (V1)
2. #46 scope ADR (shards landed under `docs/features/protocol/`)
3. #45 usage model (shard landed)
4. #48 spec (# draft section on llms-index)
5. #47 schemas (`spec/schemas/mdcp-llms-index-1.0.0.0.schema.json`)
6. #49 conformance (`spec/conformance/llms-index-v1/`)
7. V2 MCP (after V1)
8. V3 hosted API (design)
