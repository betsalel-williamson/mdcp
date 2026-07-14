# llms-index spec artifacts

Immutable **protocol bootstrap** files for MDCP agent entrypoints. Consumers fetch these into `docs/` — they are not generated per-repo.

## Protocol version history

Published protocol artifacts start at **0.4.0.0** (`mdcp.v0.4.llms.txt`) for the **0.4.0 open alpha** — the first versioned llms-index spec.

**Pre-0.4 evolution:** npm **0.1.0–0.3.0** shipped tooling and doc-authoring conventions without a recorded bootstrap in this directory. That history is in package changelogs and the **0.4.0** release changesets — not duplicated here:

| Source                                                                                                                | What it records                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [packages/mdcp-cli/CHANGELOG.md](../../packages/mdcp-cli/CHANGELOG.md)                                                | Shipped npm releases through 0.3.0                                                                                                      |
| [.changeset/](../../.changeset/)                                                                                      | Pending **0.4.0** batch: link validation, cross-guide links, unified output layout, sharded glossary, llms-index export, compile backup |
| [docs/developer/versioning-and-releases.md](../../docs/developer/versioning-and-releases.md#040-open-alpha-milestone) | Open alpha milestone and semver policy                                                                                                  |

After **v0.4.0** tags, read merged entries in `packages/*/CHANGELOG.md` and the GitHub Release — the changeset files are consumed at publish time.

## Layout

| Artifact                    | Role                                                                 |
| --------------------------- | -------------------------------------------------------------------- |
| `mdcp.v0.4.llms.txt`        | **Open alpha** — pinned alpha artifact (not yet stable)              |
| `mdcp.v0.4--draft.llms.txt` | **In progress** — edit until adopted                                 |
| `valpha`                    | Symlink → current open-alpha file (`mdcp.v{n}.llms.txt`)             |
| `vdev`                      | Symlink → current draft file (`mdcp.v{n}--draft.llms.txt`)           |
| `vstable`                   | **Reserved for npm 1.0.0** — immutable stable symlink (not used yet) |

## Draft → alpha → stable promotion

1. Edit `mdcp.v{n}--draft.llms.txt` while the spec is in progress (`vdev` points here).
2. Copy to `mdcp.v{n}.llms.txt` and point `valpha` when pinning an open-alpha release.
3. At npm **1.0.0**, promote to immutable stable: copy to final `mdcp.v{n}.llms.txt`, introduce `vstable`, reset `vdev` to the next `--draft` file.

Use the `--draft` suffix **until** a version is adopted. Do not mutate `valpha` targets after an alpha pin without a version bump.

## Do not edit in consumer repos

After fetch, `docs/mdcp.v*.llms.txt` is a **read-only protocol entrypoint** for agents. Repo-specific agent guidance belongs in `docs/extensions/` or normative shards — not hand-edits to the fetched file. Broadly applicable changes go upstream via PR to this directory.

Read [Extensions and archetypes](../../docs/features/protocol/extensions-and-archetypes.md) and [spec/extensions/](../extensions/).

## Fetch into a consumer repo

During the **0.4.0 open alpha**, prefer **`dev`** (in-progress draft). Use **`alpha`** to pin the open-alpha artifact via `valpha`.

```bash
# In-progress spec (recommended during 0.4 alpha)
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-profile dev --docs-root docs

# Pinned open-alpha artifact (valpha)
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-profile alpha --docs-root docs

# Pin to release tag
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-ref v0.4.1 --fetch-profile dev --docs-root docs

# Local mdcp checkout (no network)
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-local --fetch-profile dev --docs-root docs
```

GitHub raw path: `spec/llms-index/valpha` or `spec/llms-index/vdev`. **`vstable`** is reserved for npm **1.0.0**.

**Note:** The **v0.4.0** release tag stores `valpha` / `vdev` as git symlinks; [raw.githubusercontent.com](https://raw.githubusercontent.com/betsalel-williamson/mdcp/v0.4.0/spec/llms-index/valpha) returns the target filename only (`mdcp.v0.4.llms.txt`). `mdcp export --llms-index --fetch` follows that indirection automatically. On `main`, profile pointers are real files (see `pnpm spec:sync-llms-index`).

## Authoring profile

The llms-index lists all task-type prompts under `.agents/skills/mdcp/agents/` (populated by fetch). Source artifacts: [spec/extensions/prompts-mdcp-defaults/0.4.0.0/](../extensions/prompts-mdcp-defaults/0.4.0.0/) (extension **`prompts-mdcp-defaults`** 0.4.0.0). Normative table: [docs/features/protocol/agent-task-prompts.md](../../docs/features/protocol/agent-task-prompts.md).

## Maintainer sync

Regenerate draft from the static template (no repo-specific section):

```bash
pnpm spec:sync-llms-index
```

Introduce `vstable` manually when npm **1.0.0** ships and the protocol version is adopted.

## Conformance

See [spec/conformance/llms-index-v0.4/](../conformance/llms-index-v0.4/).
