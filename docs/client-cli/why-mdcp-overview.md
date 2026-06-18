# Why MDCP

LLM pair-coding on a real repo breaks down when documentation is a single monolith, unvalidated, and tangled up with implementation. Merge conflicts stack up on one giant README. Agents guess `#anchor` slugs that rot after the next edit. Every turn dumps the whole guide into context. Shards and published output drift apart silently. A one-off bash script holds it together until nobody owns it.

## The usual fixes do not solve that

| Approach                            | What it misses                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| Monolithic README / full `llms.txt` | No sharding, no validation gate, no stable refs registry                                         |
| Context7 / large crawled corpora    | Fuzzy retrieval — not author-controlled, deterministic, or PR-reviewable                         |
| Cursor rules / `AGENTS.md`          | Host-native friction hints, not validated product context in git                                 |
| Docusaurus / MkDocs / VitePress     | Strong public doc sites — weak agent-first `refs lookup`, scoped export, and CI structural gates |
| MCP filesystem reads                | Delivers whatever exists; does not enforce shard discipline at authoring time                    |

MDCP is complementary to MCP and doc-site generators: it owns **authoring, compile invariants, and the validation gate** upstream of delivery. See [Scope and positioning](../features/protocol/01-scope-and-positioning.md).

## Adopt it today

The open-alpha CLI is a working foundation, not a slide deck:

- **Ship faster with agents** — `mdcp refs lookup` resolves link targets from compiled output; `mdcp export --llm` scopes context to what the next turn needs instead of re-sending the entire README.
- **Stop doc drift before merge** — `mdcp check` runs the same compile → refs → xrefs pipeline for agents, CI, and human reviewers.
- **Edit docs like code** — small shards, manifest order, one compile step; publish to monolith, `DEVELOPERS.md`, or npm READMEs from the same source.
- **Keep plan separate from implementation** — shards hold context and the high-level plan; code holds how. Structure enforces that split.

Task prompts and a bootstrap index get you started in a consumer repo without inventing workflow from scratch: [Why mdcp for coding agents](./why-mdcp-for-agents.md), [LLM collaboration](./llm-collaboration.md), [Alternatives and adoption](../features/protocol/02-alternatives-and-adoption.md).

## Where it is going

Like [OpenAPI](https://www.openapis.org/) standardized HTTP API contracts, MDCP is evolving into an open contract for **documentation context** — intent, design, and terminology you can share with other systems. That benefits inter-agent development (validated shards and glossaries instead of re-crawling ad hoc prose) and human-in-the-loop verification: reviewers read the same compiled context agents use and confirm the system behaves as documented. Roadmap: [Vision and roadmap](../features/protocol/00-vision-and-roadmap.md).
