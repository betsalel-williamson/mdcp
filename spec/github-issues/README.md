# GitHub issue drafts (Phase 0)

Publish these on GitHub when ready. Implementation for Phase 1 is already in the repo.

## New issues to create

| File                                               | Title                               |
| -------------------------------------------------- | ----------------------------------- |
| [53-phase1-llms-index.md](53-phase1-llms-index.md) | Phase 1: mdcp.v1.llms.txt bootstrap |
| [54-v2-mcp-server.md](54-v2-mcp-server.md)         | V2: MDCP MCP server                 |
| [55-v3-hosted-api.md](55-v3-hosted-api.md)         | V3: Hosted context API              |

## Existing issues to update

| File                                                 | Issue |
| ---------------------------------------------------- | ----- |
| [44-epic-update.md](44-epic-update.md)               | #44   |
| [45-usage-model-update.md](45-usage-model-update.md) | #45   |
| [46-adr-update.md](46-adr-update.md)                 | #46   |
| [47-schemas-update.md](47-schemas-update.md)         | #47   |
| [48-spec-update.md](48-spec-update.md)               | #48   |
| [49-conformance-update.md](49-conformance-update.md) | #49   |

```bash
# Example: create Phase 1 issue
gh issue create --title "Phase 1: mdcp.v1.llms.txt bootstrap (protocol 1.0.0.0) + export --llms-index" \
  --label "enhancement,export,documentation" \
  --body-file spec/github-issues/53-phase1-llms-index.md
```
