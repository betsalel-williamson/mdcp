# llms-index export (V1 bootstrap)

**WORK_ITEM:** [#58](https://github.com/betsalel-williamson/mdcp/issues/58) (parent epic [#44](https://github.com/betsalel-williamson/mdcp/issues/44))

## Summary

Versioned agent bootstrap file `mdcp.v0.4.llms.txt` (protocol `0.4.0.0`) plus `mdcp export --llms-index`. **First published llms-index spec** (open alpha). Pre-0.4 doc-style evolution: [package changelogs](https://github.com/betsalel-williamson/mdcp/blob/main/packages/mdcp-cli/CHANGELOG.md) and [0.4.0 changesets](https://github.com/betsalel-williamson/mdcp/tree/main/.changeset/). Canonical artifacts: [`spec/llms-index/`](../../spec/llms-index/) (`valpha`, `vdev`; `vstable` at npm 1.0.0).

## End-user value

Agents and humans get a **short, self-contained entrypoint** (~60–100 lines) focused on the sharded documentation workflow — not the normative protocol spec. Teams adopt incrementally: copy bootstrap → shard docs → wire config → regenerate index.

## Acceptance criteria

- [x] `mdcp.v0.4.llms.txt` at docs root with header `mdcp-llms-index: 0.4.0.0`
- [x] Abbreviated filename `mdcp.v0.4.llms.txt` equivalent to `mdcp.v0.4.0.0.llms.txt`
- [x] `mdcp export --llms-index` merges repo-specific `compileOrder` and scripts
- [x] `mdcp export --llms-index --fetch` pulls from `spec/llms-index/valpha` or `vdev`
- [x] Draft naming `mdcp.v{n}--draft.llms.txt` until adopted; symlinks `valpha` / `vdev`
- [x] `review-task.prompt.md` listed in spec artifact and [Agent task prompts](./protocol/agent-task-prompts.md)
- [x] Static copy in `examples/sample-guides/`
- [x] Agent task prompts documented in [Agent task prompts](./protocol/agent-task-prompts.md)
- [x] Conformance vector: `spec/conformance/llms-index-v0.4/`

## Commands

```bash
# Generate from local config (repo-specific section + template)
mdcp export --llms-index --config docs/mdcp.config.json --docs-root docs

# Fetch canonical bootstrap from spec/llms-index (day zero — no config required)
mdcp export --llms-index --fetch --fetch-profile dev --docs-root docs
mdcp export --llms-index --fetch --fetch-profile alpha --docs-root docs

# Pin to release tag
mdcp export --llms-index --fetch --fetch-ref v0.4.0 --fetch-profile dev --docs-root docs

# Fork / local protocol development
mdcp export --llms-index --fetch --fetch-repo owner/fork --fetch-ref my-branch --fetch-profile dev --docs-root docs
mdcp export --llms-index --fetch --fetch-local --fetch-profile dev --docs-root docs
```

Config (optional after day zero):

- `protocol.profile` — `alpha` (`valpha`) or `dev` (`vdev`) under `spec/llms-index/`
- `protocol.ref` — optional branch or tag when the profile symlink is not on `main` (dogfood / pre-release)
- `protocol.llmsIndex.outputFile` — default `mdcp.v0.4.llms.txt` under docs root
- `extensions.packs[]` — enabled packs and optional per-pack `version` / `source` override

Do **not** duplicate fetch fields under `extensions` — use `protocol.profile` + `protocol.ref`. See [Extension fetch security](../../../spec/extensions/SECURITY.md) before overriding `repo` or `baseUrl`.

- Spec artifacts: [`spec/llms-index/`](../../spec/llms-index/README.md)

## Design

| Piece            | Location                      |
| ---------------- | ----------------------------- |
| Generator        | `export/llms-index.ts` (core) |
| Upstream fetch   | `export/llms-index-fetch.ts`  |
| Spec artifacts   | `spec/llms-index/vdev`        |
| CLI flag         | `mdcp export --llms-index`    |
| Protocol version | `protocolVersion` in config   |
| Spec             | `mdcp-1.0-spec.md` (§9.2)     |

## Agent workflow

Use [feature-level-task.prompt.md](../../spec/extensions/prompts-mdcp-defaults/0.4.0.0/feature-level-task.prompt.md) with `WORK_ITEM` set to the bootstrap issue (or `.caches/mdcp/prompts/feature-level-task.prompt.md` after fetch). Load scope via [Agent work-item tracking](../developer/agent-work-item-tracking.md).

## Out of scope (V1)

- MCP server (V2)
- Hosted query API (V3)
- Automated `extensions` key in `mdcp.config.json` (documented pattern only; see [Extensions and archetypes](./protocol/extensions-and-archetypes.md))
