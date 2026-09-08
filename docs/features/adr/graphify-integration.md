# ADR: Graphify as a Companion Peer Tool

**Status:** Proposed  
**Date:** 2026-09-08  
**Context:** Evaluate adding [Graphify](https://github.com/Graphify-Labs/graphify) to MDCP's companion toolchain alongside Prettier, markdownlint-cli2, Vale, and markdown-link-check

## Summary

MDCP's companion toolchain already provides format consistency (Prettier), syntax lint (markdownlint-cli2), prose quality (Vale), and external link health (markdown-link-check). A gap remains: **code-awareness**. Documentation shards reference source-code symbols, files, and APIs, but no peer tool currently validates that those references stay fresh or helps agents understand the codebase structure before writing docs.

Graphify fills this gap. It builds a deterministic knowledge graph from code via tree-sitter AST parsing — no LLM calls for code — producing a `graph.json` that maps every function, class, module, and their relationships. As a peer tool it would serve two roles:

1. **Context search** — agents query the graph to understand codebase architecture before authoring or updating shards
2. **Doc freshness** — cross-reference graph entities against MDCP's shard inventory and refs registry to detect stale docs referencing renamed/deleted symbols, or undocumented public APIs

## How It Fits the Peer Pattern

MDCP's existing peer integration follows a consistent pattern in `peers/resolve.ts`:

- `findPeerBinary(name, cwd)` — discovers the tool on PATH or in `node_modules/.bin/`
- `runPeer(tool, { cwd, args })` — shells out with graceful skip when not installed
- CLI flags `--require-*` / `--skip-*` — user controls strictness
- Config section in `mdcp.config.json` — tool-specific options (scan paths, config file)

Graphify slots into this pattern as `findPeerBinary('graphify', cwd)`. Its Python runtime is irrelevant at the integration boundary — it's discovered on PATH like Vale (a Go binary), not bundled as a Node dependency.

### Proposed config surface

```jsonc
// mdcp.config.json
{
  "graphify": {
    "graphFile": "_build/.caches/graph.json",  // consumed by codeEvidence hook + freshness check
    "scanPaths": ["src", "packages"],           // directories to graph (default: repo root)
    "mode": "default"                           // "default" or "deep"
  }
}
```

### Proposed CLI additions

| Command | Behavior |
|---------|----------|
| `mdcp graph` | Run `graphify extract . --format json --output <graphFile>` as a peer |
| `mdcp check --skip-graphify` | Skip Graphify during full validation |
| `mdcp check --require-graphify` | Fail if Graphify not installed |

During `mdcp check`, when Graphify is available:
1. Run `graphify extract` to produce/refresh `graph.json`
2. Load the graph and cross-reference against `refs.json` and shard file inventory
3. Report: undocumented public symbols, shards referencing deleted/renamed entities

## Pros

### Completes the toolchain

Each existing peer covers one quality dimension. Graphify adds the missing code-to-docs dimension:

| Peer | Dimension |
|------|-----------|
| Prettier | Format consistency |
| markdownlint-cli2 | Markdown syntax |
| Vale | Prose quality |
| markdown-link-check | External URL health |
| **Graphify** | **Code-symbol freshness + context** |

### Strengthens the codeEvidence hook

The `codeEvidence` compile hook currently uses regex-based symbol search (`lineForSymbol` in `code-evidence.ts`) to resolve `[symbol](file.ts)` links to line numbers. This works for simple cases but misses re-exports, aliased imports, and overloaded names. Graphify's AST-parsed entity graph provides a more reliable symbol table — the hook could consult `graph.json` as a fallback when grep-style matching is ambiguous.

### Zero-LLM for code

Graphify's code parsing is deterministic (tree-sitter AST), preserving MDCP's zero-LLM build pipeline. The `graphify extract` command for source code makes no API calls — it only needs LLMs for non-code content (PDFs, images), which MDCP wouldn't use.

### Peer-pattern fit is clean

Same discovery/skip/require pattern as every other peer. No new dependency mechanism, no Python embedded in Node, no coupling to Graphify internals. MDCP consumes `graph.json` as a build artifact — if the schema changes, only the consumer code updates.

### Agents benefit immediately

MDCP skills already instruct agents to understand codebase structure before writing docs. With Graphify installed, the `mdcp-feature-level` skill could instruct agents to run `graphify query` or read `graph.json` for targeted context, replacing the current "grep around and hope" approach.

### High community momentum

115K+ stars, daily releases, Apache-2.0 license. The risk of abandonware is low. The project has a commercial entity (Graphify Labs) and enterprise offering backing continued development.

## Cons

### Extra runtime dependency

Users need Python 3.10+ and `pip install graphifyy` (or `uv tool install graphifyy`). This is heavier than Vale (single Go binary) but follows the same "install on PATH" contract. CI environments need an extra setup step.

### Pre-1.0 output schema

Graphify is at v0.9.x. The `graph.json` schema may change between versions. MDCP's consumer code would need version-aware parsing or pinned version requirements. Mitigated by consuming only the stable node/edge core (`{id, label, source_file}` / `{source, target, relation}`).

### Graph rebuild latency

On large codebases, `graphify extract` can take seconds to minutes. Running it on every `mdcp check` may slow CI. Mitigated by caching `graph.json` and only rebuilding when source files change (Graphify supports `--update` for incremental rebuilds).

### Narrow consumption surface

MDCP would consume a small fraction of Graphify's output — entity names, file locations, and relationships. Features like community detection, interactive visualization, and the query interface are valuable for agents but orthogonal to the compile/check pipeline. The integration ROI is focused on two specific checks (freshness + evidence), not the full Graphify feature set.

### Double-y PyPI name

The package is published as `graphifyy` (not `graphify`) on PyPI due to a naming conflict. This is a minor UX friction for installation instructions.

## Implementation Plan

### Phase 1: Peer discovery + `mdcp graph` command

- Add `graphify` config section to `MdcpConfigSchema`
- Add `findPeerBinary('graphify', cwd)` call in CLI
- Add `mdcp graph` command that shells out to `graphify extract`
- Add `--skip-graphify` / `--require-graphify` flags to `mdcp check`

### Phase 2: Freshness check in `mdcp check`

- Load `graph.json` during check
- Cross-reference graph entities (exported functions, classes, modules) against shard content
- Report: symbols documented in shards but missing from graph (stale docs), public symbols in graph with no shard mention (undocumented APIs)
- Severity controlled by config (warn vs. error)

### Phase 3: Enhanced codeEvidence hook

- When `graph.json` exists, use it as a symbol lookup fallback in `codeEvidenceHook`
- Resolve ambiguous symbols (re-exports, aliases) via graph edges rather than regex
- Fall back to current grep-based resolution when graph is absent

### Phase 4: Skill integration

- Update `mdcp-feature-level` skill to instruct agents to consult `graph.json` or run `graphify query` before authoring shards
- Add Graphify to the recommended companion toolchain in developer docs

## Decision

Proceed with Graphify as an optional peer tool. Follow the same `findPeerBinary` / `runPeer` / config-section pattern as existing peers. Consume `graph.json` only — no runtime coupling to Graphify's Python process beyond the initial extract command.
