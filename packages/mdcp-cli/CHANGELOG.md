# @bwilliamson/mdcp-cli

## 0.3.0

### Minor Changes

- Enable built-in compile hooks by default (`stripAnchors`, `codeEvidence`, `inlineInserts`, `reviewLinks`). Omit `guides[].compile.hooks` for the common case; opt out per hook with an object (`{ "codeEvidence": false }`) or replace the pipeline with a string array. Previously, every hook had to be listed explicitly on each guide.

  Expand the published npm README with LLM collaboration prompt templates.

  The compiled `packages/mdcp-cli/README.md` now opens with developer pain and which mdcp commands address it, plus docs-first feature workflow (tracker scope, feature and client shards, TDD), task-type prompts, and getting-started setup. Standalone copy-paste files live under `examples/prompts/`.

  Rename the MDCP expansion from Markdown Command Line Interface Processor to MarkDown Context Protocol.

  User-facing updates include npm package descriptions, `mdcp --help` text, and the compiled CLI README opening. The new name reflects mdcp as a protocol for repository documentation context — not only a CLI wrapper.

  Restructure the published npm README for LLM-first adoption.

  The compiled `packages/mdcp-cli/README.md` now opens with a value proposition for coding agents, the copy-paste bootstrap prompt (within the first ~80 lines), and follow-up prompt templates. Install, config, and command reference content is unchanged but moved below agent onboarding.

  **What changed:** shard order in `docs/client-cli/` — new `why-mdcp-for-agents.md` opening shard; `llm-collaboration.md` leads with bootstrap and follow-up prompts; glossary and reference sections compile later in the README.

  **Old behavior that no longer applies:** the npm README previously opened with install/quick start and placed the bootstrap prompt ~370 lines down under LLM collaboration. Deep links to `#llm-collaboration` still resolve; the bootstrap anchor is now `#bootstrap-prompt-copy-paste` near the top.

  Document preprocessor and templating as intentionally out of scope.

  MDCP does not run variable substitution, template engines, or macro-style transforms on shard source. Compile hooks remain documentation-assembly transforms on [authored GFM](https://github.com/betsalel-williamson/mdcp/blob/main/docs/glossary/authored-gfm.md) — not a substitute for Handlebars, Nunjucks, or similar.

  **Consumer guidance:** wire optional stages as `preprocess → mdcp compile / check → postprocess` in your repo. There is no behavior change to compile or hooks; this release clarifies boundaries that were previously implicit.

### Patch Changes

- Updated dependencies
  - @bwilliamson/mdcp-core@0.3.0

## 0.2.0

### Minor Changes

- b42ea7b: Compound consumer migration parity release (closes #19).

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

  **Migration:** preserve pre-0.2.0 layout with explicit `"outputDir": "."`, `"outputFile": "guides.md"`, `"refs": { "registryFile": "refs.json" }`. See `docs/client-cli/consumer-migration.md`.

### Patch Changes

- Updated dependencies [b42ea7b]
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
