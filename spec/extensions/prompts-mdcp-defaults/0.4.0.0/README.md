# Default mdcp prompts (`prompts-mdcp-defaults` 0.4.0.0)

Versioned **meta-level** copy-paste prompts — the **default mdcp prompts extension pack**. Path: `spec/extensions/prompts-mdcp-defaults/0.4.0.0/` (extension **0.4.0.0**, requires protocol **0.4.0.0**).

Other prompt packs use the `prompts-*` prefix (e.g. `prompts-acme-internal` for org-specific overlays).

## Consumer repos

**Phase 1 — day zero (no config):**

```bash
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-profile dev --docs-root docs
```

**Phase 2 — pin protocol profile + extensions in `mdcp.config.json`, then re-fetch:**

```json
{
  "protocol": {
    "profile": "alpha",
    "ref": "v0.4.0"
  },
  "extensions": {
    "packs": [{ "id": "prompts-mdcp-defaults", "enabled": true, "version": "0.4.0.0" }]
  }
}
```

```bash
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-ref v0.4.0 --config docs/mdcp.config.json --docs-root docs
```

Prompts cache to `.caches/mdcp/prompts/` (`manifest.json` records extension `version`, `protocolVersion`, and upstream `ref`).

Host-specific agent systems **MAY** substitute their own prompts. Written shards **SHOULD** still follow the fetched llms-index layout.

## Prompt files

| File                                                                         | Use when                              |
| ---------------------------------------------------------------------------- | ------------------------------------- |
| [getting-started-with-mdcp.prompt.md](./getting-started-with-mdcp.prompt.md) | Bootstrapping a sharded docs pipeline |
| [feature-level-task.prompt.md](./feature-level-task.prompt.md)               | Feature work — docs-first, then TDD   |
| [doc-only-task.prompt.md](./doc-only-task.prompt.md)                         | Documentation-only revisions          |
| [design-architecture-task.prompt.md](./design-architecture-task.prompt.md)   | RFCs, ADRs, data models               |
| [ux-task.prompt.md](./ux-task.prompt.md)                                     | UI flows and client guides            |
| [review-task.prompt.md](./review-task.prompt.md)                             | Architecture and security review      |

## Maintainer sync

When editing prompts here, run `pnpm spec:sync-llms-index` if the llms-index task table changed, and `pnpm docs:compile:repo` so dogfooded docs stay aligned.
