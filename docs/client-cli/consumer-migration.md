# Consumer migration

Add `source` to your config pointing at your existing monolith, then:

```bash
mdcp shard
mdcp compile
mdcp check
```

## Guide manifests and compile order

Compile order comes from link order in each guide's `index.md` or `shards.md`. List shards in the manifest in the order you want them stitched.

When a manifest has preamble prose with example inline links (not section shards), set `compile.sectionsHeading` — see [Manifest compile order](../features/manifest-compile-order.md).

After changing a guide's `index.md`, run `mdcp compile` and `mdcp check` — there is no separate manifest sync step.

## Output layout

MDCP uses an NPM-style two-root layout. Full breaking-change table for upgrades from earlier releases: [Legacy migration — unified output layout](../features/legacy-migration.md#unified-output-layout-breaking).

| Concept          | Default                            | Notes                                                                    |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| Docs root        | `--docs-root`                      | One subdirectory per guide; `compileOrder` selects which folders compile |
| Output root      | `outputDir: "_build"`              | Safe to delete; all generated paths relative here unless absolute        |
| Per-guide output | `{name}.md` under `_build`         | Or `guide.md` when only one guide                                        |
| Monolith         | Opt-in via top-level `outputFile`  | Omitted by default                                                       |
| Refs registry    | `.caches/refs.json` under `_build` | Derived state, not publish-facing                                        |

Path resolution details: [Config essentials — path layout](./config-essentials.md#path-layout).

## Compile hooks

Register hooks per guide in `guides[].compile.hooks`:

| Hook            | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `stripAnchors`  | Remove explicit heading anchor markers from shard bodies              |
| `inlineInserts` | Inline diagram, table, figure, and media catalog shards on first link |
| `codeEvidence`  | Resolve evidence links to GitHub line-number fragments                |
| `reviewLinks`   | Rewrite review links; optional hooksConfig.reviewLinks.targetMonolith |

Cross-guide `.md` links rewrite automatically from `compileOrder` and per-guide `compile.outputFile`. Hook specs: [Compile hooks](../client-core/compile-hooks/index.md). Cross-monolith rewriting: [Cross-guide links](../client-core/compile-hooks/cross-guide-links.md).

## Multi-guide config

Multi-guide repos typically set per-guide publish targets, `sectionsHeading`, and hooks:

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

- `compile.scopeRoot` helps resolve shard-relative paths in nested guide trees (for example `review/outcomes/FIND-004.md`).
- Publish paths like `../packages/foo/README.md` resolve from `outputDir` (`_build`).

## Steps for a new consumer repo

1. Add `mdcp.config.json` to your docs shard directory
2. Add repo-root npm scripts, for example `mdcp compile --config docs/mdcp.config.json --docs-root docs` (see [Config essentials](./config-essentials.md#--config-vs---docs-root))
3. Add `mdcp check --require-lint` (and `--require-vale` when Vale is configured)
4. Use `mdcp refs lookup` for cross-link slugs (no `{#heading-ids}`)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

Maintainer port map from earlier MDCP layouts: [Legacy migration](../features/legacy-migration.md).

## Verification checklist

After setting up a consumer repo:

1. **`mdcp compile`** — per-guide outputs under `_build/` (or explicit `compile.outputFile` targets); optional monolith when `outputFile` is set
2. **`mdcp check --require-lint`** — orphans, xrefs, markdownlint on in-scope guide shards only
3. **`mdcp check --require-vale`** — when Vale is configured
4. **Hook output** — diagram tables inlined (`inlineInserts`), code evidence blocks resolved (`codeEvidence`), cross-monolith links rewritten (no raw `../other-guide/shard.md` in compiled output)
