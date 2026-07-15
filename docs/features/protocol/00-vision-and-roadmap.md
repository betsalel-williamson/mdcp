# Vision and roadmap

MDCP (**MarkDown Context Protocol**) is an [Agent Skill](../../glossary/agent-skills.md) and repo-local practice for **system context** — intent, design, and terminology in Markdown shards, with compile and check so the same docs serve people and coding agents. Think of [OpenAPI](https://www.openapis.org/) as a useful analogy for _contracts_, not as claiming MDCP is an industry standards body.

## Problem

Large documentation dumps (monolithic README, site-wide `llms.txt`, crawled corpora like Context7) overload agent context windows. Teams also lack a shared, reviewable place for **what documentation means** — especially when legacy projects reuse the same terms for different concepts. Mind maps, arch docs, and specs scatter across tools and never compound in the repo.

MDCP does not magically erase documentation debt. It helps head it off by putting durable context in the right place: **small shards** are the source of truth; agents and humans pull **one section at a time** (host search is enough to find it). That scale works for a team of one or a full product, engineering, and marketing org.

## Principles

| Principle                      | Implication                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| High level over implementation | Shards hold plan, constraints, acceptance criteria; code holds how                                       |
| Glossary as first-class        | Domain terms and legacy disambiguation live in dedicated shards                                          |
| Document before build/migrate  | Capture context in shards before greenfield work or migrations                                           |
| Granular, safe context         | Read one shard; `export --llm` only when broader context is needed                                       |
| Direct value only              | Ship capabilities that close a unique gap                                                                |
| Skill + open toolchain         | Delivered as an Agent Skill; CLI/`mdcp-core` implement compile and check without locking you into a host |
| Extensions over core           | `docs/extensions/` locally; shared packs in complementary skills                                         |

Filter for new capabilities: [Direct value bar](../design-constraints/direct-value-bar.md).

## Phased delivery

| Phase  | Surface                                                                                                           | Access model                  |
| ------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **V1** | **Agent Skills** pack (`skills/mdcp`, install to `.agents/skills/mdcp`) + `mdcp compile`/`check` + task subagents | Repo access (SSH, clone, IDE) |
| **V2** | MDCP MCP server (shard read, glossary search)                                                                     | Repo access                   |
| **V3** | Hosted context API (OpenAPI spec, API keys, polyglot clients)                                                     | Opt-in publish                |

```text
  V1 authoring     shards → compile → check → mdcp.v*.llms.txt
        ↓
  V2 delivery      MCP adapter (optional)
        ↓
  V3 delivery      HTTPS API + API keys (optional)
```

**V1 phase ≠ semver 1.0.** Roadmap phase names describe delivery surfaces; npm and protocol stability promises align at npm **1.0.0** / **`vstable`** promotion — not during open alpha (`valpha`).

## Positioning

| Approach                         | MDCP relationship                                       |
| -------------------------------- | ------------------------------------------------------- |
| Monolithic `llms.txt` dump       | Replaced by Agent Skills pack + on-demand shards        |
| Context7 / large crawled corpora | Author-controlled, deterministic, PR-reviewable         |
| OpenAPI                          | Analogy: contract for documentation context             |
| MCP                              | Complementary delivery on top of MDCP artifacts         |
| Pandoc / static-site generators  | Downstream publish; MDCP owns authoring and query layer |

MDCP is **not** an MCP server. MCP delivers runtime access; MDCP enforces shard discipline, compile invariants, and CI validation gates.

## Coexistence with other doc stacks

MDCP authoring is [GFM-only](../design-constraints/gfm-scope.md). Compiled GFM output can feed Pandoc, MkDocs, Docusaurus, or other publish pipelines. Agent-only guides and publish-only guides may differ in scope.

Task-type subagents in `skills/mdcp/agents/` are part of the V1 authoring profile — [Agent task subagents](./agent-task-prompts.md).

## Related issues

- Protocol formalization epic: [GitHub #44](https://github.com/betsalel-williamson/mdcp/issues/44)
- V1 bootstrap: [#58](https://github.com/betsalel-williamson/mdcp/issues/58) (shipped)
- V2 MCP server: [#59](https://github.com/betsalel-williamson/mdcp/issues/59)
- V3 hosted API: [#60](https://github.com/betsalel-williamson/mdcp/issues/60)
- Scope ADR: [#46](https://github.com/betsalel-williamson/mdcp/issues/46)
- Usage model: [#45](https://github.com/betsalel-williamson/mdcp/issues/45)
- Normative spec: [#48](https://github.com/betsalel-williamson/mdcp/issues/48)
- Performance SLOs and benchmarks: [#64](https://github.com/betsalel-williamson/mdcp/issues/64) — [Performance goals and review](./performance.md)
