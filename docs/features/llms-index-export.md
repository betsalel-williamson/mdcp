# llms-index export (V1 bootstrap)

**WORK_ITEM:** Phase 1 bootstrap — [GitHub issue draft](../../spec/github-issues/53-phase1-llms-index.md) (publish as issue; parent [#44](https://github.com/betsalel-williamson/mdcp/issues/44))

## Summary

Versioned agent bootstrap file `mdcp.v1.llms.txt` (protocol `1.0.0.0`) plus `mdcp export --llms-index` so any repo can drop an index in the docs root before full MDCP wiring.

## End-user value

Agents and humans get a **short entrypoint** (~80–200 lines) instead of loading entire guides or monolithic `llms.txt` dumps. Teams adopt MDCP incrementally: copy bootstrap → shard docs → wire config → regenerate index.

## Acceptance criteria

- [x] `mdcp.v1.llms.txt` at docs root with header `mdcp-llms-index: 1.0.0.0`
- [x] Abbreviated filename `mdcp.v1.llms.txt` equivalent to `mdcp.v1.0.0.0.llms.txt`
- [x] `mdcp export --llms-index` merges repo-specific `compileOrder` and scripts
- [x] Static copy in `examples/sample-guides/`
- [x] Agent task prompts documented in [Agent task prompts](./protocol/agent-task-prompts.md)
- [x] Conformance vector: `spec/conformance/llms-index-v1/`

## Commands

```bash
mdcp export --llms-index --config docs/mdcp.config.json --docs-root docs
```

Config: `export.llmsIndex.outputFile` (default `mdcp.v1.llms.txt` under docs root).

## Design

| Piece            | Location                                         |
| ---------------- | ------------------------------------------------ |
| Generator        | `packages/mdcp-core/src/export/llms-index.ts`    |
| CLI flag         | `mdcp export --llms-index`                       |
| Protocol version | `protocolVersion` in `mdcp.config.json`          |
| Spec             | `docs/features/protocol/mdcp-1.0-spec.md` (§9.2) |

## Agent workflow

Use [feature-level-task.prompt.md](../../examples/prompts/feature-level-task.prompt.md) with `WORK_ITEM` set to the bootstrap issue. Load scope via [Agent work-item tracking](../developer/agent-work-item-tracking.md).

## Out of scope (V1)

- MCP server (V2)
- Hosted query API (V3)
