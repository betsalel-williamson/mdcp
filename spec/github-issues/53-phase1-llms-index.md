## Summary

Ship the **V1 bootstrap reference implementation**: versioned `mdcp.v1.llms.txt` (protocol `1.0.0.0`) plus `mdcp export --llms-index` generator.

Parent epic: #44

Canonical direction: [docs/features/protocol/00-vision-and-roadmap.md](docs/features/protocol/00-vision-and-roadmap.md)

## Status

**Implemented in repo** — implemented per [feature-level-task.prompt.md](../../examples/prompts/feature-level-task.prompt.md) with acceptance criteria in [llms-index-export.md](../../docs/features/llms-index-export.md).

## Agent workflow

1. Set `WORK_ITEM` to this issue number after publish
2. `WORK_ITEM_LOOKUP` → `docs/developer/agent-work-item-tracking.md`
3. Feature shard: `docs/features/llms-index-export.md`
4. Protocol: `docs/features/protocol/agent-task-prompts.md`

## Filename and versioning

| Convention             | Rule                                          |
| ---------------------- | --------------------------------------------- |
| Preferred filename     | `mdcp.v1.llms.txt`                            |
| Full form (equivalent) | `mdcp.v1.0.0.0.llms.txt`                      |
| In-file header         | `mdcp-llms-index: 1.0.0.0` (always four-part) |
| Location               | Docs root (`--docs-root`)                     |

Trailing `.0` segments may be omitted in the filename only.

## Deliverables

- [x] Canonical `docs/mdcp.v1.llms.txt`
- [x] Static copy in `examples/sample-guides/mdcp.v1.llms.txt`
- [x] `mdcp export --llms-index` in core + CLI
- [x] `protocolVersion` in config schema (default `1.0.0.0`)
- [x] Update getting-started prompt
- [x] Conformance vector: `spec/conformance/llms-index-v1/`

## Follow-ups

- #46 ADR, #45 usage model, #47 full schemas, #49 conformance runner
