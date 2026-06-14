# Consumer migration

Add `source` to your config pointing at your existing monolith, then:

```bash
mdcp shard
mdcp compile
mdcp check
```

## Legacy script port map

Repos that used custom `scripts/docs/` tooling (for example the [doubling-compound](https://github.com/Doubling-Inc/doubling-compound) pipeline) can replace scripts with MDCP commands and compile hooks:

| Legacy script                                 | MDCP replacement                                                    |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `compile-sections.js`                         | `mdcp compile` — order from manifest links                          |
| `inline-diagrams.js`                          | **`inlineInserts`** compile hook (not `inlineDiagrams`)             |
| `resolve-code-evidence.js`                    | **`codeEvidence`** compile hook                                     |
| `rewrite-review-links.js`                     | **`reviewLinks`** compile hook + automatic cross-guide link rewrite |
| `write-sections-manifest.py` / `sections.txt` | Removed — list shards in `index.md` or `shards.md`                  |
| `mdcp sections`                               | Removed — no separate manifest sync step                            |
| `validate.sh` / link lint                     | `mdcp check --require-lint`                                         |

Hook specs: [Compile hooks](../client-core/compile-hooks/index.md). Cross-monolith rewriting: [Cross-guide links](../client-core/compile-hooks/cross-guide-links.md).

## Guide manifests and compile order

Compile order comes from link order in each guide's `index.md` or `shards.md`. List shards in the manifest in the order you want them stitched.

When a manifest has preamble prose with example inline links (not section shards), set `compile.sectionsHeading` — see [Manifest compile order](../features/manifest-compile-order.md).

After changing a guide's `index.md`, run `mdcp compile` and `mdcp check` — there is no separate manifest sync step.

## Unified output layout

MDCP 0.2.0 uses an NPM-style two-root layout. Full breaking-change table: [Legacy migration — unified output layout](../features/legacy-migration.md#unified-output-layout-breaking).

| Concept          | Default                            | Notes                                                                    |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| Docs root        | `--docs-root`                      | One subdirectory per guide; `compileOrder` selects which folders compile |
| Output root      | `outputDir: "_build"`              | Safe to delete; all generated paths relative here unless absolute        |
| Per-guide output | `{name}.md` under `_build`         | Or `guide.md` when only one guide                                        |
| Monolith         | Opt-in via top-level `outputFile`  | Omitted by default                                                       |
| Refs registry    | `.caches/refs.json` under `_build` | Derived state, not publish-facing                                        |

Path resolution details: [Config essentials — path layout](./config-essentials.md#path-layout).

**Preserve pre-0.2.0 layout temporarily:** set `"outputDir": "."`, `"outputFile": "guides.md"`, `"refs": { "registryFile": "refs.json" }` explicitly.

## Compound-style config sketch

Multi-guide consumer repos typically set per-guide publish targets and explicit hooks:

```json
{
  "outputDir": "_build",
  "compileOrder": ["glossary", "architecture-review", "technical-guide"],
  "guides": [
    {
      "name": "glossary",
      "compile": {
        "outputFile": "glossary.md",
        "sectionsHeading": "Sections",
        "hooks": ["stripAnchors", "inlineInserts", "reviewLinks"]
      }
    },
    {
      "name": "architecture-review",
      "path": "review",
      "compile": {
        "manifest": "shards.md",
        "outputFile": "architecture-review.md",
        "sectionsHeading": "Sections",
        "scopeRoot": ".",
        "hooks": ["stripAnchors", "codeEvidence", "inlineInserts", "reviewLinks"],
        "hooksConfig": {
          "reviewLinks": { "targetMonolith": "architecture-review.md" }
        }
      }
    }
  ],
  "refs": { "registryFile": ".caches/refs.json" },
  "lint": { "xrefs": { "enabled": true } }
}
```

Notes:

- Use **`inlineInserts`**, not `inlineDiagrams` — diagram catalog inlining is handled by the `inlineInserts` hook ([#14](https://github.com/betsalel-williamson/mdcp/issues/14)).
- Cross-guide `.md` links rewrite automatically from `compileOrder` and per-guide `compile.outputFile`; `reviewLinks` handles monolith-specific review link targets when configured.
- `compile.scopeRoot` helps resolve shard-relative paths in nested guide trees (for example `review/outcomes/FIND-004.md`).
- Publish paths like `../packages/foo/README.md` resolve from `outputDir` (`_build`).

## Steps for a new consumer repo

1. Add `mdcp.config.json` to your docs shard directory
2. Replace local compile scripts with repo-root npm scripts, for example `mdcp compile --config docs/mdcp.config.json --docs-root docs` (see [Config essentials](./config-essentials.md#--config-vs---docs-root))
3. Replace validate scripts with `npx @bwilliamson/mdcp-cli check --require-lint`
4. Use `mdcp refs lookup` for cross-link slugs (no `{#heading-ids}`)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

Full maintainer migration map: [Legacy migration](../features/legacy-migration.md).

## Verification checklist

After migrating, confirm parity before merging:

1. **`mdcp compile`** — per-guide outputs under `_build/` (or explicit `compile.outputFile` targets); optional monolith when `outputFile` is set
2. **`mdcp check --require-lint`** — orphans, xrefs, markdownlint on in-scope guide shards only
3. **`mdcp check --require-vale`** — when Vale is configured
4. **Hook output** — diagram tables inlined (`inlineInserts`), code evidence blocks resolved (`codeEvidence`), cross-monolith links rewritten (no raw `../other-guide/shard.md` in compiled output)
5. **External QA** — re-run the consumer [migration QA ledger](https://github.com/Doubling-Inc/doubling-compound/blob/main/docs/features/docs-pipeline/mdcp-migration-qa.md) against published `@bwilliamson/mdcp-cli@0.2.0`
