## Summary

**V2:** MDCP MCP server — repo-local query adapter.

Parent: #44  
**Blocked on:** Phase 1 bootstrap (see #53 or implemented `mdcp.v1.llms.txt`)

## Proposed tools

| Tool                   | Maps to                    |
| ---------------------- | -------------------------- |
| `mdcp_refs_lookup`     | `mdcp refs lookup`         |
| `mdcp_list_guides`     | `compileOrder` + manifests |
| `mdcp_get_shard`       | read shard by path         |
| `mdcp_glossary_search` | fuzzy glossary match       |
| `mdcp_export_section`  | compiled slice by slug     |

Package: `@bwilliamson/mdcp-mcp` (stdio MCP, repo cwd).

## Security

Repo access only (SSH, clone, IDE) — no API keys.
