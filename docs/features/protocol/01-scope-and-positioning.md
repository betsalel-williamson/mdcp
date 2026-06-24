# Scope and positioning

Parent epic: [GitHub #44](https://github.com/betsalel-williamson/mdcp/issues/44). [Vision and roadmap](./00-vision-and-roadmap.md) covers the full phased delivery model.

## Protocol class

MDCP is an **offline document context protocol** — not a wire protocol like [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

| Dimension       | MCP                                       | MDCP                                                          |
| --------------- | ----------------------------------------- | ------------------------------------------------------------- |
| Problem         | Runtime tool and data access for AI hosts | Author, compile, and validate technical documentation context |
| Interaction     | JSON-RPC session                          | Files on disk + batch CLI                                     |
| Source of truth | Server-defined                            | **Shards in git**; compiled output is generated               |
| Validation      | Server-defined                            | Orphans, refs, xrefs, optional peer linters                   |

## Why MDCP is not an MCP server

1. **Authoring is the hard part** — MCP reads what exists; it does not enforce shard manifests, compile order, link rewriting, or orphan detection.
2. **CI and git are first-class** — documentation context must be reviewable in PRs and reproducible from a commit.
3. **Complementary** — an optional MCP adapter (V2) exposes _already-compiled_ MDCP outputs; it sits on top of MDCP, not instead of it.

```text
  [Authoring]  MDCP: shards → compile → check → export
       ↓
  [Delivery]   MCP server, file read, mdcp.v*.llms.txt, stdout
       ↓
  [Consumers]  agent host, CI, human reviewers
```

## OpenAPI analogy

OpenAPI standardizes HTTP API contracts. MDCP standardizes **documentation context contracts**: shard layout, compile invariants, refs registry, export profiles (`--llm`, `mdcp.v*.llms.txt`).

## Normative core vs reference implementation

| Layer                     | Owner                                             |
| ------------------------- | ------------------------------------------------- |
| Normative spec (MDCP 1.0) | `docs/features/protocol/` + `spec/schemas/`       |
| Protocol artifacts        | `spec/llms-index/`, `spec/conformance/`           |
| Extension packs           | `spec/extensions/` + local `docs/extensions/`     |
| Reference implementation  | `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-core` |
| Delivery adapters (V2/V3) | MCP server, hosted API                            |

## Filename versioning (`mdcp.v*.llms.txt`)

- Protocol version `0.4.0.0` → `mdcp.v0.4.llms.txt` or `mdcp.v0.4.0.0.llms.txt`
- Protocol version `0.5.0.0` (draft) → `mdcp.v0.5.llms.txt` — fetch via `vdev` profile during 0.5 development
- In-file header always four-part: `mdcp-llms-index: 0.4.0.0` (or `0.5.0.0` for draft profile)
- Drop trailing `.0` segments in filename only

## Domains beyond software repositories

MDCP is **not** limited to application codebases. The V1 transport is a **git repository** with Markdown shards; the **content domain** is orthogonal:

| Domain example        | Typical guides                         | Archetype extension (0.5+) |
| --------------------- | -------------------------------------- | -------------------------- |
| Software product      | `features/`, `client/`, `developer/`   | `arch-oss-library`         |
| Factory / operations  | procedures, equipment, safety glossary | `arch-manufacturing-ops`   |
| Training / curriculum | modules, objectives, assessments       | `arch-learning-curriculum` |
| Product docs site     | client guide + publish pipeline        | `arch-product-docs-site`   |

Modeling templates (C4, function-point worksheets, ArchiMate viewpoints) ship as optional `format-*` packs — see [Modeling framework compatibility](./modeling-framework-compatibility.md).

**Adoption (0.5):** run `mdcp init` first; choose **defaults** for a greenfield scaffold or **augment** to map MDCP onto existing `docs/` or README without deleting content.
