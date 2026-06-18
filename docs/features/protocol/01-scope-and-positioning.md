# Scope and positioning

Parent epic: [GitHub #44](https://github.com/betsalel-williamson/mdcp/issues/44). [Vision and roadmap](./00-vision-and-roadmap.md) covers the full phased delivery model.

## Protocol class

MDCP is an **offline document context protocol** — not a wire protocol like [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

| Dimension       | MCP                                       | MDCP                                                     |
| --------------- | ----------------------------------------- | -------------------------------------------------------- |
| Problem         | Runtime tool and data access for AI hosts | Author, compile, and validate repo documentation context |
| Interaction     | JSON-RPC session                          | Files on disk + batch CLI                                |
| Source of truth | Server-defined                            | **Shards in git**; compiled output is generated          |
| Validation      | Server-defined                            | Orphans, refs, xrefs, optional peer linters              |

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
| Reference implementation  | `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-core` |
| Extensions                | MCP adapter, hosted API (V2/V3)                   |

## Filename versioning (`mdcp.v*.llms.txt`)

- Protocol version `1.0.0.0` → `mdcp.v1.llms.txt` or `mdcp.v1.0.0.0.llms.txt`
- In-file header always four-part: `mdcp-llms-index: 1.0.0.0`
- Drop trailing `.0` segments in filename only
