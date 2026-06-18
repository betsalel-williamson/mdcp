# MDCP extension pack format

Normative layout and manifest schema for versioned extension packs under `spec/extensions/`. Parent: [extensions README](./README.md), [extensions and archetypes](../../docs/features/protocol/extensions-and-archetypes.md).

## Goals

- **Independent extension semver** — each pack (`prompts-mdcp-defaults`, formatting presets, etc.) versions on its own release cadence.
- **Protocol compatibility via npm semver ranges** — declare which MDCP protocol versions a pack supports using standard [npm semver range syntax](https://github.com/npm/node-semver#ranges).
- **Revocation** — maintainers can mark compromised packs (e.g. prompt injection) as `revoked` without forking the protocol core.
- **Flat catalog** — one root index for discovery; per-version manifests for fetch and cache verification.

## Directory layout

```
spec/extensions/
  manifest.json                 # catalog (required)
  {extension-id}/               # flat id — arch-, format- prefixes by kind
    {extension-version}/        # versioned fetchable packs
      manifest.json
      README.md
      …
    README.md                   # optional doc-only (no version yet)
```

Example:

```
spec/extensions/
  manifest.json
  prompts-mdcp-defaults/
    0.4.0.0/
      manifest.json
      README.md
      getting-started-with-mdcp.prompt.md
      …
  arch-oss-library/
    README.md
  arch-product-docs-site/
    README.md
  format/
    README.md
  format-docusaurus/            # future
    1.0.0/
      manifest.json
      …
```

### Extension id prefixes

| Prefix     | Examples                             | Role                                  |
| ---------- | ------------------------------------ | ------------------------------------- |
| `prompts-` | `prompts-mdcp-defaults`              | Default and custom agent prompt packs |
| `arch-`    | `arch-oss-library`                   | Project-class archetypes              |
| `format-`  | `format-docusaurus`, `format-mkdocs` | Lint/style preset packs               |

Doc-only catalog entries **MAY** list `versions: []` until a fetchable release ships.

### Catalog path

`spec/extensions/manifest.json`

### Pack path

`spec/extensions/{extension-id}/{extension-version}/`

Extension **version** uses npm semver (`MAJOR.MINOR.PATCH`, optional prerelease). It is independent of MDCP **protocol** version (`M.m.p.b` four-part form in `mdcp.config.json`).

## Catalog manifest (`spec/extensions/manifest.json`)

Top-level discovery index. **MUST** include `catalogVersion` (semver of the catalog schema) and `extensions[]`.

```json
{
  "catalogVersion": "0.4.0.0",
  "extensions": [
    {
      "id": "prompts-mdcp-defaults",
      "description": "Meta-level copy-paste agent task prompts for sharded documentation workflows",
      "tags": ["prompts", "authoring", "bootstrap"],
      "versions": [
        {
          "version": "0.4.0.0",
          "protocolVersionRange": "0.4.0.0",
          "revoked": false
        }
      ]
    }
  ]
}
```

| Field                                          | Required | Description                                          |
| ---------------------------------------------- | -------- | ---------------------------------------------------- |
| `catalogVersion`                               | yes      | Semver of this catalog file format                   |
| `extensions[].id`                              | yes      | Stable extension identifier (kebab-case)             |
| `extensions[].description`                     | yes      | Short human summary                                  |
| `extensions[].tags`                            | yes      | Discovery tags                                       |
| `extensions[].versions[].version`              | yes      | Published extension semver                           |
| `extensions[].versions[].protocolVersionRange` | yes\*    | npm semver range of supported MDCP protocol versions |
| `extensions[].versions[].revoked`              | no       | When `true`, pack **MUST NOT** be fetched            |
| `extensions[].versions[].revokedReason`        | no       | Explanation for maintainers and agents               |

\* Legacy `minProtocolVersion` / `maxProtocolVersion` are supported for migration (see below) but **SHOULD** be replaced by `protocolVersionRange`.

## Per-version manifest (`{id}/{version}/manifest.json`)

Authoritative record for one extension release. **MUST** mirror catalog fields for that version and list fetchable files.

```json
{
  "id": "prompts-mdcp-defaults",
  "version": "0.4.0.0",
  "protocolVersionRange": "0.4.0.0",
  "revoked": false,
  "files": ["getting-started-with-mdcp.prompt.md", "feature-level-task.prompt.md"]
}
```

| Field                  | Required | Description                                   |
| ---------------------- | -------- | --------------------------------------------- |
| `id`                   | yes      | Must match parent directory and catalog entry |
| `version`              | yes      | Must match parent directory name              |
| `protocolVersionRange` | yes\*    | npm semver range (see below)                  |
| `revoked`              | no       | When `true`, fetch **MUST** fail              |
| `revokedReason`        | no       | Human-readable revocation note                |
| `files`                | yes      | Filenames cached relative to this directory   |

Fetch implementations **SHOULD** load this manifest from upstream before caching pack files and **MUST** reject revoked entries or protocol mismatches.

## Protocol version ranges (npm semver)

MDCP protocol versions use a **four-part** form (`M.m.p.b`) in config and llms-index headers (e.g. `0.4.0.0`). For range checks, implementations normalize to npm semver:

| MDCP protocol | Normalized semver | Notes                                       |
| ------------- | ----------------- | ------------------------------------------- |
| `0.4.0.0`     | `0.4.0-0`         | Fourth segment → semver prerelease          |
| `0.4.0.5`     | `0.4.0-5`         | Build/revision bumps prerelease tag         |
| `0.4.1.0`     | `0.4.1-0`         | Third segment is MDCP patch level           |
| `0.4`         | `0.4.0-0`         | Abbreviated forms expand per protocol rules |

`protocolVersionRange` **MUST** use [npm semver range syntax](https://github.com/npm/node-semver#ranges). Operands **MAY** use abbreviated MDCP protocol forms; tools normalize before evaluation.

### Common patterns

| Range                | Meaning                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `*`                  | All protocol versions                                                    |
| `^0.4.0.0`           | Compatible with MDCP `0.4.x.y` lines (npm caret on normalized semver)    |
| `~0.4.0.0`           | npm tilde on `0.4.0-b` (includes further MDCP patch lines per npm rules) |
| `0.4.x`              | All npm semver patches on minor `0.4` (`0.4.0-b`, `0.4.1-b`, …)          |
| `>=0.4.0.0 <0.4.1.0` | All **build revisions** of MDCP patch `0.4.0` only                       |
| `>=0.4.0.0 <0.5.0.0` | All MDCP patches on minor `0.4`                                          |
| `0.4.0.0`            | Exact pin (equivalent to `=0.4.0.0`)                                     |

Examples for a consumer with `"protocolVersion": "0.4.0.0"`:

| `protocolVersionRange` | Matches `0.4.0.0`? | Matches `0.4.0.5`? | Matches `0.4.1.0`? | Matches `0.5.0.0`? |
| ---------------------- | ------------------ | ------------------ | ------------------ | ------------------ |
| `0.4.0.0`              | yes                | no                 | no                 | no                 |
| `>=0.4.0.0 <0.4.1.0`   | yes                | yes                | no                 | no                 |
| `^0.4.0.0`             | yes                | yes                | yes                | no                 |
| `0.4.x`                | yes                | yes                | yes                | no                 |
| `*`                    | yes                | yes                | yes                | yes                |

When `extensions.packs[].version` is omitted in `mdcp.config.json`, mdcp selects the **newest non-revoked** extension version whose `protocolVersionRange` satisfies root `protocolVersion`.

## Legacy min / max fields (deprecated)

Older manifests used point comparisons:

```json
{
  "minProtocolVersion": "0.4.0.0",
  "maxProtocolVersion": "0.4.0.0"
}
```

Implementations **MAY** synthesize a range:

| Fields                                                    | Synthesized range                                  |
| --------------------------------------------------------- | -------------------------------------------------- |
| `min` only (bare version)                                 | `>=min`                                            |
| `max` only (bare version)                                 | `<=max`                                            |
| `min` and `max` (bare versions)                           | `min - max` (semver hyphen range)                  |
| `min` contains range operators (`^`, `~`, `*`, `>`, etc.) | `min` is the full range; `max` **MUST NOT** be set |

New manifests **SHOULD** use `protocolVersionRange` only.

## Revocation

When `revoked: true`:

1. Catalog consumers **MUST NOT** auto-select that extension version.
2. Fetch **MUST** fail when a consumer pins that version.
3. `revokedReason` **SHOULD** explain the incident (e.g. `"Prompt injection in ux-task.prompt.md — use 0.4.0.1+"`).

Revocation is per **extension version**, not per protocol version.

## Consumer configuration

Pin **protocol profile** and optional **branch ref** — do not duplicate fetch fields under `extensions`:

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

| Field              | Meaning                                                 |
| ------------------ | ------------------------------------------------------- |
| `protocol.profile` | `alpha` (`valpha`) or `dev` (`vdev`) llms-index symlink |
| `protocol.ref`     | Git branch or tag when symlink is not on `main`         |
| `protocol.repo`    | Optional; defaults to `betsalel-williamson/mdcp`        |

Per-pack `extensions.packs[].source` overrides the default fetch — see [SECURITY.md](./SECURITY.md).

Cached pack manifests (`.caches/mdcp/prompts/manifest.json`) record `version`, `protocolVersion`, `protocolVersionRange`, upstream `ref`, and `files[]`.

## JSON Schema

Machine-readable schemas:

- [mdcp-extensions-catalog.schema.json](../schemas/mdcp-extensions-catalog.schema.json)
- [mdcp-extension-pack.schema.json](../schemas/mdcp-extension-pack.schema.json)

## Conformance

Reference implementation: `@bwilliamson/mdcp-core` (`packages/mdcp-core/src/extensions/`).

Tests: `packages/mdcp-core/test/extensions.test.ts`, `packages/mdcp-core/test/protocol-version-range.test.ts`.

## Changelog

| Catalog version | Changes                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| `0.4.0.0`       | Initial semver layout; `protocolVersionRange` with npm semver; legacy min/max synthesis |
