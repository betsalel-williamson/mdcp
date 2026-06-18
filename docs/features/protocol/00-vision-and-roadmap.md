# Vision and roadmap

MDCP (**MarkDown Context Protocol**) is an open, repo-local standard for **system context** — like [OpenAPI](https://www.openapis.org/) is for HTTP APIs, but for **intent, design, and terminology** rather than implementation detail in code comments.

## Problem

Large documentation dumps (monolithic README, site-wide `llms.txt`, crawled corpora like Context7) overload agent context windows. Teams also lack a shared, reviewable contract for **what documentation means** — especially when legacy projects reuse the same terms for different concepts.

MDCP inverts the model: **small shards** are the source of truth; agents pull **one section at a time** via `refs lookup` or a single shard read.

## Principles

| Principle                      | Implication                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| High level over implementation | Shards hold plan, constraints, acceptance criteria; code holds how                                        |
| Glossary as first-class        | Domain terms and legacy disambiguation live in dedicated shards                                           |
| Document before build/migrate  | Capture context in shards before greenfield work or migrations                                            |
| Granular, safe context         | `refs lookup` → single shard; `export --llm` only when broader context is needed                          |
| Open standard                  | Reference implementation is `@bwilliamson/mdcp-cli` / `mdcp-core`; protocol is implementable without them |
| Extensions over core           | `docs/extensions/` locally; shared packs in `spec/extensions/`                                            |

## Phased delivery

| Phase  | Surface                                                                                             | Access model                  |
| ------ | --------------------------------------------------------------------------------------------------- | ----------------------------- |
| **V1** | `mdcp.v1.llms.txt` bootstrap (protocol `1.0.0.0`) + agent task prompts + `mdcp export --llms-index` | Repo access (SSH, clone, IDE) |
| **V2** | MDCP MCP server (`refs lookup`, shard read, glossary search)                                        | Repo access                   |
| **V3** | Hosted context API (OpenAPI spec, API keys, polyglot clients)                                       | Opt-in publish                |

```text
  V1 authoring     shards → compile → check → mdcp.v*.llms.txt
        ↓
  V2 delivery      MCP adapter (optional)
        ↓
  V3 delivery      HTTPS API + API keys (optional)
```

## V1 bootstrap: `mdcp.v*.llms.txt`

Drop **`mdcp.v1.llms.txt`** in your docs root before full MDCP setup. The file is a **short index** (~80–200 lines), not a context dump.

| Convention     | Rule                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| Filename       | `mdcp.v{version}.llms.txt` — trailing `.0` segments may be omitted (`v1` ≡ `1.0.0.0`) |
| In-file header | Always four-part: `mdcp-llms-index: 1.0.0.0`                                          |
| Location       | Docs root (`--docs-root`)                                                             |
| Modes          | Fetch `spec/llms-index/vstable` or `mdcp export --llms-index` (repo overlay)          |
| Immutability   | Do not hand-edit fetched index — use shards and extensions doc                        |

## Positioning

| Approach                         | MDCP relationship                                       |
| -------------------------------- | ------------------------------------------------------- |
| Monolithic `llms.txt` dump       | Replaced by versioned index + on-demand shards          |
| Context7 / large crawled corpora | Author-controlled, deterministic, PR-reviewable         |
| OpenAPI                          | Analogy: contract for documentation context             |
| MCP                              | Complementary delivery on top of MDCP artifacts         |
| Pandoc / static-site generators  | Downstream publish; MDCP owns authoring and query layer |

MDCP is **not** an MCP server. MCP delivers runtime access; MDCP enforces shard discipline, compile invariants, and CI validation gates.

## Coexistence with other doc stacks

MDCP authoring is [GFM-only](../design-constraints/gfm-scope.md). Compiled GFM output can feed Pandoc, MkDocs, Docusaurus, or other publish pipelines. Agent-only guides and publish-only guides may differ in scope.

Task-type prompts in `examples/prompts/` are part of the V1 authoring profile — [Agent task prompts](./agent-task-prompts.md).

## Related issues

- Protocol formalization epic: [GitHub #44](https://github.com/betsalel-williamson/mdcp/issues/44)
- V1 bootstrap: [#58](https://github.com/betsalel-williamson/mdcp/issues/58) (shipped)
- V2 MCP server: [#59](https://github.com/betsalel-williamson/mdcp/issues/59)
- V3 hosted API: [#60](https://github.com/betsalel-williamson/mdcp/issues/60)
- Scope ADR: [#46](https://github.com/betsalel-williamson/mdcp/issues/46)
- Usage model: [#45](https://github.com/betsalel-williamson/mdcp/issues/45)
- Normative spec: [#48](https://github.com/betsalel-williamson/mdcp/issues/48)
