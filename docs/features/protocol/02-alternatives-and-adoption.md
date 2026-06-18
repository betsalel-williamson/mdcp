# Alternatives and adoption

Read [Scope and positioning](./01-scope-and-positioning.md) and [Vision and roadmap](./00-vision-and-roadmap.md).

## Alternatives comparison

| Incumbent                           | What it does well        | What MDCP adds                                                |
| ----------------------------------- | ------------------------ | ------------------------------------------------------------- |
| Monolithic README / full `llms.txt` | Zero tooling             | Sharding, `refs lookup`, validation gate, versioned index     |
| Context7 / large crawled corpora    | Fuzzy retrieval at scale | Author-controlled, deterministic, PR-reviewable shards        |
| Custom bash/Python glue             | Flexible                 | Owned `check` gate, link rewrite, publish paths               |
| Docusaurus / MkDocs / VitePress     | Public doc sites         | Agent-first `refs lookup`, `export --llm`, CI structural gate |
| Cursor rules / `AGENTS.md`          | Host-native friction     | Validated product context separate from host config           |
| MCP filesystem                      | Live file reads          | Upstream authoring discipline and validated artifacts         |

## Pandoc and advanced publish stacks

MDCP shards are [GFM-only](../design-constraints/gfm-scope.md). Adopters with Pandoc, LaTeX, or wikilinks are not excluded:

- Compile to GFM monolith or per-guide outputs; feed downstream publish pipelines.
- Run parallel guides for agent-only vs site-only content when scopes differ.

## Bootstrap-first adoption

1. Copy `mdcp.v0.4.llms.txt` into docs root **before** `mdcp.config.json` exists.
2. Use your existing agent to shard a monolith and plan glossary entries.
3. Wire mdcp, compile, validate, regenerate index with `mdcp export --llms-index`.

## When to adopt MDCP

**Choose MDCP when:**

- Documentation is outgrowing monolith size (merge conflicts, broken anchors)
- LLM pair-coding needs scoped, validated context
- Same shards publish to multiple outputs (monolith + README + `DEVELOPERS.md`)
- CI must fail on structural doc drift

**Do not choose MDCP when:**

- README-only repo with no growth pain
- Docs live entirely outside git
- You only need a public website with no agent/CI validation requirement

## Learning investment

| Investment                          | Payback                            |
| ----------------------------------- | ---------------------------------- |
| Bootstrap copy + one config session | Replaces bespoke compile scripts   |
| Shard + manifest workflow           | Smaller PRs, fewer merge conflicts |
| Four core commands                  | Same gate for human, agent, and CI |
