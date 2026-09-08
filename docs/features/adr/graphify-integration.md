# ADR: Graphify Integration Evaluation

**Status:** Proposed  
**Date:** 2026-09-08  
**Context:** Evaluate whether [Graphify](https://github.com/Graphify-Labs/graphify) should be integrated into MDCP

## Summary

Graphify is a Python tool (115K+ stars, Apache-2.0) that transforms codebases into queryable knowledge graphs using deterministic tree-sitter AST parsing. It produces interactive HTML visualizations, structured JSON graphs, and markdown reports. This ADR evaluates whether and how it could complement MDCP's docs-as-code system.

## Integration Angles

Three plausible integration approaches exist, ranked by fit:

### A. Graphify as a peer tool (like Vale or markdownlint)

MDCP already resolves and shells out to peer linters. Graphify could serve as another peer — invoked during `mdcp check` or as a standalone command — to validate that documentation shards reference real code entities. The `graph.json` output maps every function, class, and module in the codebase; MDCP's `codeEvidence` hook already resolves symbol references to line numbers in source files. Graphify's graph could make that resolution more accurate and comprehensive.

### B. Graph-powered cross-reference enrichment

MDCP's `refs.json` registry maps heading slugs to source shards. Graphify's entity graph maps code symbols to files and relationships. Combining them could detect documentation gaps — code entities with no corresponding doc shard — or stale docs that reference renamed/deleted symbols.

### C. Agent Skill that leverages Graphify for context

An MDCP skill variant could instruct agents to run `/graphify .` before authoring documentation, giving the agent a structured understanding of the codebase's architecture before it writes or updates shards.

## Pros

### Strong alignment on "structure over search"

Both tools reject naive text search in favor of structured representations. MDCP structures docs as a shard DAG; Graphify structures code as a knowledge graph. Together they cover the full code-to-docs pipeline with structured, deterministic representations rather than embedding-based approximation.

### Code-evidence hook enrichment

MDCP's `codeEvidence` compile hook resolves source-code links to line-number fragments. Graphify's AST-parsed `graph.json` could provide a richer, more reliable symbol table than the current grep-based resolution — especially for cross-file references, re-exports, and aliased imports across 37+ languages.

### Documentation gap detection

Graphify identifies every entity (function, class, module) and their relationships. Cross-referencing this against MDCP's shard inventory and refs registry could surface undocumented public APIs, orphaned docs for deleted code, or coverage gaps — a natural extension of MDCP's existing orphan and coverage checks.

### Mature, actively developed

At 115K+ stars with daily releases (v0.9.56 as of Sep 2026), Graphify has substantial community validation. The Apache-2.0 license is compatible with MDCP's MIT license. The modular pipeline (`detect → extract → build → cluster → analyze → export`) makes it practical to consume just the pieces needed.

### MCP server mode

Graphify can run as an MCP server, which aligns with MDCP's agent-first distribution model. An agent could query the Graphify MCP server for codebase structure while simultaneously using MDCP skills for documentation discipline.

### Multiple export formats

Graph output in JSON, GraphML, Cypher, and Obsidian vault formats means MDCP could consume the structured data without coupling to Graphify's internal representation.

## Cons

### Language runtime mismatch

MDCP is TypeScript/Node.js. Graphify is Python 3.10+. Integration requires either shelling out to a Python process (like the existing peer linter pattern) or consuming Graphify's JSON output as a build artifact. Either approach adds a Python runtime dependency to what is currently a pure Node.js toolchain, complicating installation and CI setup.

### Heavy dependency footprint

Graphify pulls in NetworkX, NumPy, 37+ tree-sitter parsers, and optional LLM provider SDKs. Even a minimal install (`pip install graphifyy`) is substantially heavier than MDCP's current peer tools (Vale is a single Go binary; markdownlint-cli2 is a Node package). This weight may not justify itself for projects that only need documentation validation.

### Pre-1.0 API instability

Despite explosive growth, Graphify is at v0.9.x on a `v8` default branch, suggesting rapid iteration and potential breaking changes. MDCP would need to pin versions carefully and treat Graphify's output schema as unstable, adding maintenance burden.

### Overlapping but divergent goals

Graphify builds a general-purpose knowledge graph for AI agent consumption. MDCP enforces a documentation discipline with compile-time validation. The overlap is narrow — code-symbol-to-doc mapping — and the integration surface is smaller than it appears at first glance. Most of Graphify's features (community detection, query interface, visualization) are orthogonal to MDCP's core value proposition.

### LLM dependency for non-code content

Graphify's code parsing is deterministic (tree-sitter), but its PDF, image, and natural-language processing requires LLM API calls. MDCP is currently zero-LLM at the toolchain level (agents use LLMs, but `mdcp compile` and `mdcp check` do not). Adding Graphify for documentation enrichment could introduce LLM costs and nondeterminism into what is currently a deterministic build pipeline.

### Adoption friction for MDCP users

MDCP targets documentation authors and AI agents. Requiring users to install Python, pip, and Graphify raises the barrier to entry for a tool that currently only needs Node.js. This is especially relevant for CI environments where adding Python adds build time and complexity.

## Recommendation

**Start with Approach A: peer tool integration.** Add Graphify as an optional peer (like Vale) — discovered on PATH, never required. Consume `graph.json` output for two specific use cases:

1. **Enhanced `codeEvidence` hook** — Use the entity graph for more reliable symbol-to-line resolution
2. **Coverage gap check** — Cross-reference graph entities against the shard inventory during `mdcp check`

This keeps the integration surface small, avoids hard dependencies, and lets users opt in. Defer Approaches B and C until the peer integration proves its value.

Do not embed Graphify as a core dependency or rewrite any MDCP pipeline stage to require it.
