# Cross-guide link rewriting

Specification for assembly-time cross-shard and cross-guide link rewriting. Tests in `packages/mdcp-core/test/cross-guide-links.test.ts` map to the sections below (docs first, then TDD).

Multi-output consumer repos compile separate monoliths (for example `glossary.md`, `architecture-review.md`, `technical-guide.md`) from shards that span `review/`, `security/`, `features/`, and sibling guide directories. Source shards link with relative `.md` paths; compiled output must use stable in-document or cross-monolith `#slug` targets so link-fragment lint passes.

## Cross-guide purpose

At compile time, MDCP:

1. Builds a **guide link index** from every guide in `compileOrder` — each manifest-listed shard maps to its compiled `{outputBasename, slug}` (slug from the demoted first heading, same rules as intra-guide rewrite), plus shards linked transitively from section bodies
2. Rewrites **cross-guide** `.md` links per shard (using the shard path for relative resolution) before sections are stitched
3. Rewrites **same-guide** `./section.md` links on the assembled body (intra-guide pass)

Pair with `compile.publishPathRewrite` when publish outputs also need repo-root path normalization for non-markdown targets.

## Cross-guide link matching

A link is rewritten when **all** of the following hold:

- Standard markdown link syntax: `[label](path)`
- Target path ends in `.md` (optional `#fragment`)
- Target is not `http://`, `https://`, or `#…`
- Target resolves to a shard registered in the guide link index

Same-guide `./section.md` links are handled by the intra-guide pass after assembly; cross-guide rewrite handles `../` and repo-scoped paths that point at another guide's shards.

## Cross-guide resolution

Path lookup order (relative to the **current shard** directory):

1. Relative to the shard directory (`dirname(sourceFile)`)
2. Relative to the shard parent directory
3. `compile.scopeRoot` when set on the compiling guide
4. `process.cwd()` and its parent

When the resolved absolute path is in the guide link index:

| Case                                             | Rewritten target                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| Same compiled output as the compiling guide      | `#slug` or `#fragment` when the link includes a fragment                |
| Different compiled output (`compile.outputFile`) | `{outputBasename}#slug` (for example `architecture-review.md#find-004`) |
| Monolith output (no per-guide `outputFile`)      | `#slug`                                                                 |

Finding shards (`FIND-*.md`) use the finding id from the filename (for example `#find-004`), not the parent outcomes section slug.

## Cross-guide exclusions

The pass **does not** transform:

- External URLs
- Same-document `#fragment` links
- Markdown links that do not resolve to an indexed shard
- Non-markdown paths (handled by `codeEvidence` or left unchanged)

## Cross-guide config

Minimal multi-output setup — index and rewrite run automatically from `compileOrder` and per-guide `compile.outputFile`:

```json
{
  "compileOrder": ["glossary", "architecture-review", "technical-guide"],
  "guides": [
    {
      "name": "glossary",
      "path": "glossary",
      "compile": {
        "scopeRoot": ".",
        "outputFile": "glossary.md"
      }
    },
    {
      "name": "architecture-review",
      "path": "review",
      "compile": {
        "scopeRoot": ".",
        "manifest": "shards.md",
        "outputFile": "architecture-review.md"
      }
    }
  ]
}
```

Optional **`reviewLinks`** hook — same rewrite rules with an explicit override when every cross-guide link should target one monolith file (`hooksConfig.reviewLinks.targetMonolith`). Prefer assembly-time index rewrite when guides map to separate outputs; use `targetMonolith` for legacy single-file review layouts. See [reviewLinks](./review-links.md).

## Cross-guide compile example

Glossary shard input (`glossary/terms.md`):

```markdown
See [FIND-004](../review/outcomes/FIND-004.md) in the architecture review.
```

Review shard (`review/outcomes/FIND-004.md`):

```markdown
# FIND-004 — Example finding

Body.
```

Compiled glossary output:

```markdown
See [FIND-004](architecture-review.md#find-004) in the architecture review.
```
