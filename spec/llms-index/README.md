# llms-index spec artifacts

Immutable **protocol bootstrap** files for MDCP agent entrypoints. Consumers fetch these into `docs/` — they are not generated per-repo.

## Layout

| Artifact                    | Role                                                           |
| --------------------------- | -------------------------------------------------------------- |
| `mdcp.v{n}.llms.txt`        | **Adopted stable** — immutable once the protocol version ships |
| `mdcp.v{n}--draft.llms.txt` | **In progress** — edit until adopted; then promote to stable   |
| `vstable`                   | Symlink → current adopted stable file                          |
| `vdev`                      | Symlink → current draft file                                   |

## Draft → stable promotion

1. Edit `mdcp.v{n}--draft.llms.txt` while the spec is in progress (`vdev` points here).
2. When the protocol version is adopted (release tag), copy draft content to `mdcp.v{n}.llms.txt`.
3. Update `vstable` if the stable filename changed; reset `vdev` to the next `--draft` file.

Use the `--draft` suffix **until** a version is adopted. Do not mutate stable files after release.

## Do not edit in consumer repos

After fetch, `docs/mdcp.v*.llms.txt` is a **read-only protocol entrypoint** for agents. Repo-specific agent guidance belongs in `docs/extensions/` or normative shards — not hand-edits to the fetched file. Broadly applicable changes go upstream via PR to this directory.

Read [Extensions and archetypes](../../docs/features/protocol/extensions-and-archetypes.md) and [spec/extensions/](../extensions/).

## Fetch into a consumer repo

```bash
# Adopted stable (pinned protocol API)
mdcp export --llms-index --fetch --fetch-profile stable --docs-root docs

# In-progress spec (protocol development)
mdcp export --llms-index --fetch --fetch-profile dev --docs-root docs

# Pin to release tag
mdcp export --llms-index --fetch --fetch-ref v1.0.0 --fetch-profile stable --docs-root docs

# Local mdcp checkout (no network)
mdcp export --llms-index --fetch --fetch-local --fetch-profile dev --docs-root docs
```

GitHub raw path: `spec/llms-index/vstable` or `spec/llms-index/vdev`.

## Authoring profile

The llms-index lists all task-type prompts, including **`review-task.prompt.md`** (architecture and security review). Normative table: [docs/features/protocol/agent-task-prompts.md](../../docs/features/protocol/agent-task-prompts.md).

## Maintainer sync

Regenerate draft from the static template (no repo-specific section):

```bash
pnpm spec:sync-llms-index
```

Promote to stable manually when adopting a protocol version.

## Conformance

See [spec/conformance/llms-index-v1/](../conformance/llms-index-v1/).
