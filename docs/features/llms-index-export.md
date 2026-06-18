# llms-index export (V1 bootstrap)

**WORK_ITEM:** [#58](https://github.com/betsalel-williamson/mdcp/issues/58) (parent epic [#44](https://github.com/betsalel-williamson/mdcp/issues/44))

## Summary

Versioned agent bootstrap file `mdcp.v1.llms.txt` (protocol `1.0.0.0`) plus `mdcp export --llms-index`. **Canonical immutable artifacts** live in [`spec/llms-index/`](../../spec/llms-index/) (`vstable`, `vdev`, `--draft` until adopted).

## End-user value

Agents and humans get a **short entrypoint** (~80–200 lines) instead of loading entire guides or monolithic `llms.txt` dumps. Teams adopt MDCP incrementally: copy bootstrap → shard docs → wire config → regenerate index.

## Acceptance criteria

- [x] `mdcp.v1.llms.txt` at docs root with header `mdcp-llms-index: 1.0.0.0`
- [x] Abbreviated filename `mdcp.v1.llms.txt` equivalent to `mdcp.v1.0.0.0.llms.txt`
- [x] `mdcp export --llms-index` merges repo-specific `compileOrder` and scripts
- [x] `mdcp export --llms-index --fetch` pulls from `spec/llms-index/vstable` or `vdev`
- [x] Draft naming `mdcp.v{n}--draft.llms.txt` until adopted; symlinks `vstable` / `vdev`
- [x] `review-task.prompt.md` listed in spec artifact and [Agent task prompts](./protocol/agent-task-prompts.md)
- [x] Static copy in `examples/sample-guides/`
- [x] Agent task prompts documented in [Agent task prompts](./protocol/agent-task-prompts.md)
- [x] Conformance vector: `spec/conformance/llms-index-v1/`

## Commands

```bash
# Generate from local config (repo-specific section + template)
mdcp export --llms-index --config docs/mdcp.config.json --docs-root docs

# Fetch canonical bootstrap from spec/llms-index (day zero — no config required)
mdcp export --llms-index --fetch --fetch-profile stable --docs-root docs
mdcp export --llms-index --fetch --fetch-profile dev --docs-root docs

# Pin to release tag
mdcp export --llms-index --fetch --fetch-ref v1.0.0 --fetch-profile stable --docs-root docs

# Fork / local protocol development
mdcp export --llms-index --fetch --fetch-repo owner/fork --fetch-ref my-branch --fetch-profile dev --docs-root docs
mdcp export --llms-index --fetch --fetch-local --fetch-profile dev --docs-root docs
```

Config:

- `export.llmsIndex.outputFile` — default `mdcp.v1.llms.txt` under docs root
- `export.llmsIndex.upstream` — default fetch source (`repo`, `ref`, `profile: stable|dev`, optional `path`)
- Spec artifacts: [`spec/llms-index/`](../../spec/llms-index/README.md)

## Design

| Piece            | Location                      |
| ---------------- | ----------------------------- |
| Generator        | `export/llms-index.ts` (core) |
| Upstream fetch   | `export/llms-index-fetch.ts`  |
| Spec artifacts   | `spec/llms-index/vstable`     |
| CLI flag         | `mdcp export --llms-index`    |
| Protocol version | `protocolVersion` in config   |
| Spec             | `mdcp-1.0-spec.md` (§9.2)     |

## Agent workflow

Use [feature-level-task.prompt.md](../../examples/prompts/feature-level-task.prompt.md) with `WORK_ITEM` set to the bootstrap issue. Load scope via [Agent work-item tracking](../developer/agent-work-item-tracking.md).

## Out of scope (V1)

- MCP server (V2)
- Hosted query API (V3)
- Automated `extensions` key in `mdcp.config.json` (documented pattern only; see [Extensions and archetypes](./protocol/extensions-and-archetypes.md))
