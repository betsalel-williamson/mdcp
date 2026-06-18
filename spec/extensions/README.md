# MDCP extensions

Optional packs that extend the **protocol core** without forking it. The core stays small and versioned; extensions let industries and project types adopt helpful documentation standards.

## What belongs here vs in the protocol core

| Location                           | Content                                        | Changed by                            |
| ---------------------------------- | ---------------------------------------------- | ------------------------------------- |
| `spec/llms-index/`                 | Versioned agent bootstrap (`mdcp.v*.llms.txt`) | Maintainers; immutable after adoption |
| `spec/schemas/`                    | JSON Schema for artifacts                      | Maintainers                           |
| `spec/conformance/`                | Test vectors                                   | Maintainers                           |
| **`spec/extensions/`**             | Archetypes, formatting packs, pointer profiles | Community + maintainers               |
| `docs/extensions/` (consumer repo) | Local or proprietary overlays                  | Your team                             |

**Agents must not edit fetched `mdcp.v*.llms.txt` in a consumer docs root.** Put repo-specific agent guidance in `docs/extensions/` or normative shards.

## Layout

Each extension is a **flat top-level id** under `spec/extensions/`. Versioned fetchable packs use `{id}/{version}/`; doc-only archetypes may ship a README at `{id}/README.md` until a versioned pack exists.

```
spec/extensions/
  manifest.json                 # flat catalog: id, tags, description, versions[]
  prompts-mdcp-defaults/        # default prompts pack
    0.4.0.0/
      manifest.json
      README.md
      *.prompt.md
  arch-oss-library/             # doc-only archetype (example)
    README.md
  arch-product-docs-site/
    README.md
  format/                       # formatting extension index (doc-only)
    README.md
  format-docusaurus/            # future versioned formatting pack
    1.0.0/
      manifest.json
      …
```

### Extension id prefixes

| Prefix     | Example ids                          | Purpose                                     |
| ---------- | ------------------------------------ | ------------------------------------------- |
| `prompts-` | `prompts-mdcp-defaults`              | Agent prompt packs (mdcp defaults + custom) |
| `arch-`    | `arch-oss-library`                   | Project-class starter patterns              |
| `format-`  | `format-docusaurus`, `format-mkdocs` | Lint/style presets per publish stack        |

### Catalog (`manifest.json`)

The root catalog is a flat index of extension ids, human descriptions, tags, and published version entries (with `protocolVersionRange`, and `revoked` flags). Entries with empty `versions[]` are doc-only until a fetchable release ships. See **[FORMAT.md](./FORMAT.md)** and **[SECURITY.md](./SECURITY.md)**.

## Use an extension

1. Read the extension README under `{id}/` or `{id}/{version}/`.
2. For fetchable packs: enable in `mdcp.config.json` (optionally pin `version`), then `mdcp export --llms-index --fetch`.
3. For doc-only archetypes: copy patterns into your repo; link from guide `index.md` manifests.

## Publish an extension

1. Fork the mdcp repository.
2. Add `spec/extensions/{id}/{version}/` (or `{id}/README.md` for doc-only) and register in `manifest.json`.
3. Open a PR — broadly useful packs merge here.

## Proprietary local extensions

You **do not** have to contribute extensions back. MIT-licensed mdcp imposes no copyleft on your `docs/extensions/` tree.

## SOLID alignment

Extensions follow the [protocol SOLID principles](../../docs/features/protocol/extensions-and-archetypes.md#solid-principles-for-mdcp): optional, composable, and must not break core `mdcp check` when unused.

## Status

Open alpha (0.4.0) ships the **catalog + semver extension packs** under `spec/extensions/`. Enable and pin packs in `mdcp.config.json`. MCP discovery of extension packs is future work (V2+).
