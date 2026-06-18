# @bwilliamson/mdcp-presets

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

## 0.2.0

## 0.1.5

### Patch Changes

- Version sync for release; no preset changes.

## 0.1.4

### Patch Changes

- Split intra-guide and publish-path link rewriting: intra-guide `./section.md` links rewrite on every compile; `compile.publishPathRewrite` drives repo-root path rewrites for publish outputs. Fix `compileGuides` to return an empty string when all guides have `outputFile`. Export `GuideConfigInput`, `MdcpConfigInput`, and `CompileOptionsInput`.

## 0.1.3

## 0.1.2

### Patch Changes

- Support mixed monolith and per-guide publish outputs: guides with `compile.outputFile` write to a separate path and are excluded from the monolith; guides without `outputFile` still compile into `guides.md`. Add optional `compile.includeBanner` per guide (defaults to false when `outputFile` is set).

  `mdcp sections` now writes guide-relative paths in `sections.txt` (regenerated from `index.md`) instead of absolute filesystem paths.

## 0.1.1

### Patch Changes

- Rename packages to the `@bwilliamson/mdcp-*` npm scope and add registry READMEs for CLI, core, and presets.
