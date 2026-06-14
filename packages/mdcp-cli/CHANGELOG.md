# @bwilliamson/mdcp-cli

## 0.2.0

### Minor Changes

- Compound consumer migration parity release (closes #19).

  **Breaking changes:**

  - `outputDir` default `.` → `_build`
  - Guide shard dir `{outputDir}/{name}` → `{docsRoot}/{name}`
  - Default compile output: monolith `guides.md` → per-guide `{name}.md` (or `guide.md` when one guide)
  - Monolith is opt-in via top-level `outputFile`
  - `refs.registryFile` default `refs.json` → `.caches/refs.json`
  - CLI `--cwd` removed; use `--docs-root`
  - `mdcp sections` and `sections.txt` removed — compile order from manifest links (`compile.sectionsHeading` when needed)
  - All generated paths resolve under `outputDir` unless absolute

  **Added:**

  - Compile hooks: `inlineInserts` (diagram/table/figure inlining), `codeEvidence`, `reviewLinks` with cross-guide link rewriting
  - In-scope shard lint and Vale prose (`guideScanDirs`, optional `lint.markdownlint.shardsGlobs`)
  - `vale.strictMinAlertLevel` config; directory shard source support in `mdcp shard`

  **Fixed:**

  - CLI `--config` resolves from invocation directory, not docs root
  - `refs.registryFile` no longer double-joined with `outputDir`
  - Blank line after injected compile title

  **Migration:** use `inlineInserts` instead of `inlineDiagrams`; see `docs/client-cli/consumer-migration.md`. Preserve pre-0.2.0 layout with explicit `"outputDir": "."`, `"outputFile": "guides.md"`, `"refs": { "registryFile": "refs.json" }`.

### Patch Changes

- Updated dependencies
  - @bwilliamson/mdcp-core@0.2.0

## 0.1.5

### Patch Changes

- Drop `@vvago/vale` from documented dev dependencies; install Vale separately so `vale` is on your `PATH`. Update bootstrap prompt, LLM collaboration guide, and compiled README for a three-tier docs layout (`docs/features/`, `docs/developer/`, `docs/client/`).
- Updated dependencies
  - @bwilliamson/mdcp-core@0.1.5

## 0.1.4

### Patch Changes

- Split intra-guide and publish-path link rewriting: intra-guide `./section.md` links rewrite on every compile; `compile.publishPathRewrite` drives repo-root path rewrites for publish outputs. Fix `compileGuides` to return an empty string when all guides have `outputFile`. Export `GuideConfigInput`, `MdcpConfigInput`, and `CompileOptionsInput`.
- Updated dependencies
  - @bwilliamson/mdcp-core@0.1.4

## 0.1.3

### Patch Changes

- fc5719b: Add LLM collaboration guide for agent workflows, bootstrap prompt, and Cursor agent rule. Recompile repository docs and package READMEs.
- Updated dependencies [fc5719b]
  - @bwilliamson/mdcp-core@0.1.3

## 0.1.2

### Patch Changes

- Support mixed monolith and per-guide publish outputs: guides with `compile.outputFile` write to a separate path and are excluded from the monolith; guides without `outputFile` still compile into `guides.md`. Add optional `compile.includeBanner` per guide (defaults to false when `outputFile` is set).

  `mdcp sections` now writes guide-relative paths in `sections.txt` (regenerated from `index.md`) instead of absolute filesystem paths.

- Updated dependencies
  - @bwilliamson/mdcp-core@0.1.2

## 0.1.1

### Patch Changes

- Rename packages to the `@bwilliamson/mdcp-*` npm scope and add registry READMEs for CLI, core, and presets.
- Updated dependencies
  - @bwilliamson/mdcp-core@0.1.1
