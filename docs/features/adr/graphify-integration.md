# ADR: Graphify as Agent Research Layer

**Status:** Proposed  
**Date:** 2026-09-08  
**Context:** Evaluate adding [Graphify](https://github.com/Graphify-Labs/graphify) to the MDCP ecosystem as the structured code-research tool that agents use alongside the MDCP documentation system

## The Gap

MDCP's companion toolchain validates *structural* integrity of documentation:

| Tool | What it validates |
|------|-------------------|
| Prettier | Format consistency |
| markdownlint-cli2 | Markdown syntax |
| Vale | Prose quality |
| markdown-link-check | External URL health |
| `mdcp check` (built-in) | Link resolution, orphan shards, refs registry, coverage |

None of these answer the question: **"Is this documentation accurate relative to the current code?"**

That question — detecting drift between what a shard claims and what the code actually does — is fundamentally agentic work. It requires reading the doc, understanding the code, and reasoning about the gap. No lint rule can do it.

Today, when an agent maintains MDCP shards, its research phase is `agent + grep`: read the shard, grep around looking for referenced symbols, hope the results are representative. This works for simple cases but fails on re-exports, aliased imports, renamed internals, or any codebase complex enough to need structured docs in the first place.

## What Graphify Adds

Graphify builds a deterministic knowledge graph from code via tree-sitter AST parsing — no LLM calls for source code. It maps every function, class, module, and their relationships into a queryable `graph.json`.

The value is not as another step in `mdcp check`. It is as the research layer that replaces `agent + grep` with `agent + graphify`:

| Agent task | Without Graphify | With Graphify |
|------------|------------------|---------------|
| "What does this module do?" | Grep for the filename, read it, grep for its callers | Query the graph for the node and its edges |
| "Is this shard still accurate?" | Grep for symbols mentioned in the shard, manually compare | Query the graph for those entities, check existence and relationships |
| "What changed since this shard was written?" | `git log` + grep, hope you find the right files | `graphify diff` or compare graph snapshots |
| "What's undocumented?" | No way to know without reading everything | Compare graph entities against shard inventory |
| "How does X relate to Y?" | Grep both, read surrounding code, infer | Query the graph for paths between nodes |

The agent still does the reasoning. Graphify gives it better inputs.

## How It Fits

Graphify is a companion tool — discovered on PATH like Vale, not embedded as a dependency. But its role is different from the lint peers: it serves the agent's research phase, not the `mdcp check` validation pipeline.

Two integration surfaces:

### 1. Agent skill instructions

The consolidated MDCP skill instructs agents to use Graphify when available:

- Before authoring a new shard: run `graphify query` to understand the entities and relationships the shard should cover
- Before updating an existing shard: query the graph for the entities the shard references, check if any have been renamed, moved, or deleted
- When assessing coverage: compare graph entities (exported functions, public classes) against the shard inventory to find documentation gaps

When Graphify is not installed, the agent falls back to grep-based research. The skill treats it as an enhancement, not a requirement.

### 2. codeEvidence compile hook

The `codeEvidence` hook currently uses regex to resolve `[symbol](file.ts)` links to line numbers. When `graph.json` exists, the hook can consult it as a more reliable symbol table — especially for cross-file references, re-exports, and aliased imports. This is the one place Graphify touches the build pipeline, and it degrades gracefully to the current regex approach when absent.

### What Graphify does NOT do in this integration

- It does not run during `mdcp check` — doc-accuracy validation is agentic, not automated
- It does not become a required dependency — the skill and hook both degrade gracefully
- It does not replace `mdcp check` — structural validation (links, orphans, refs) remains deterministic and fast
- It does not add LLM calls to the build — code parsing is tree-sitter AST, zero API calls

## Pros

### Structured research replaces grep

The core value: agents get a map of the codebase instead of a flashlight. Graph queries are deterministic, complete (every entity in every supported language), and relationship-aware. Grep finds text matches; Graphify finds semantic entities.

### Zero-LLM for code

Graphify's code parsing is deterministic (tree-sitter AST), so the research layer adds no LLM cost. The agent's reasoning is the only LLM call in the loop.

### Aligns with MDCP's three audience scenarios

- **Brownfield (poor docs):** Agent uses Graphify to survey the codebase structure, then authors shards that cover what actually exists — not what someone remembered to document
- **Migrating (good docs, poor AI extension experience):** Agent uses Graphify to verify existing docs against current code, catching drift that accumulated during manual maintenance
- **Greenfield:** Agent uses Graphify to keep docs accurate as the codebase evolves past anyone's mental model

### Mature and actively developed

115K+ stars, daily releases (v0.9.56 as of Sep 2026), Apache-2.0 license. Commercial entity (Graphify Labs) backing continued development. 37+ language support via tree-sitter.

### Clean integration boundary

MDCP consumes `graph.json` as a build artifact — a stable, documented data format. No runtime coupling to Graphify's Python internals. If the schema changes, only the codeEvidence fallback and skill instructions need updating.

## Cons

### Extra runtime for users

Python 3.10+ required. Heavier than Vale (single Go binary). CI environments need an extra setup step. Mitigated by treating it as optional — the skill and hook both work without it.

### Pre-1.0 schema risk

v0.9.x with rapid iteration. The `graph.json` schema may change. Mitigated by consuming only the stable core (node id/label/source_file, edge source/target/relation) and version-pinning in install instructions.

### Graph rebuild latency

Large codebases take seconds to minutes for `graphify extract`. Not a problem for agent research (run once, query many times) but would be a problem if it were in the `mdcp check` hot path — which it isn't.

### Value is agent-dependent

Graphify's contribution is proportional to how much agentic doc maintenance the team does. A team that hand-maintains shards gets less value than a team that relies on AI agents for doc updates. This is fine — MDCP already targets AI-assisted workflows.

### Package name friction

Published as `graphifyy` (double-y) on PyPI due to a naming conflict. Minor UX friction for install instructions.

## Recommendation

Add Graphify as a recommended companion tool, not a peer in the check pipeline. Integration is two things:

1. **Skill instructions** that tell agents to use `graphify query` / `graph.json` for research when available, falling back to grep when not
2. **codeEvidence hook enhancement** that consults `graph.json` for symbol resolution when the file exists, falling back to the current regex approach

Do not add Graphify to `mdcp check`. Do not make it a required dependency. Do not add a `mdcp graph` CLI command — Graphify has its own CLI, and wrapping it adds coupling without value.

## Decision

Proceed. Graphify is `agent + graphify` — it makes agents better at the work that `mdcp check` structurally cannot do.
