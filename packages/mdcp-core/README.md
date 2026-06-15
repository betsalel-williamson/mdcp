# @bwilliamson/mdcp-core

## Overview

Core library for **mdcp** — compile sharded Markdown guides, build section link registries, validate structure, and export LLM-friendly output.

Use this package when you need mdcp behavior in scripts, CI pipelines, editors, or other tools without shelling out to the CLI.

### Requirements

- Node.js **>= 22.12.0**

### Install

```bash
npm install @bwilliamson/mdcp-core
```

The CLI (`@bwilliamson/mdcp-cli`) depends on this package. Install `@bwilliamson/mdcp-core` directly only when you need the programmatic API.

### Stability

**Pre-1.0:** There is **no API stability guarantee** until **1.0.0**. Exported functions, types, `mdcp.config.json` schema, and compile output may change in any `0.x.y` release. Pin a specific version and read package changelogs before upgrading.

## Glossary

Shared acronyms and terms for all mdcp docs. Spell out on first use in a shard and link the short form here.

### MDCP

**MarkDown Context Protocol** — a protocol for repository documentation context: sharded intent and design in Markdown, validated compile output for agents, CI, and human readers. The CLI is one surface; `compile`, `check`, `refs lookup`, and `export --llm` implement the shared context layer.

### GFM

**GitHub Flavored Markdown** — standard Markdown plus GitHub extensions (tables, task lists, fenced code). Not Pandoc, LaTeX, or wikilinks.

### Authored GFM

Shard markdown as written before compile — no preprocessor substitution or template conditionals. Compile hooks may transform it during assembly; see [Preprocessor / templating (out of scope)](#preprocessor-templating-out-of-scope).

### ignoreGuides

Guide names listed on the **compiling** guide under `compile.crossGuideLinks.ignoreGuides`. Cross-guide links to those guides keep source shard `.md` paths instead of rewriting to monolith `#slug` targets. Does not exclude the guide from `compileOrder` or the link index — only skips link rewrite for those targets. See [Cross-guide link rewriting](#cross-guide-link-rewriting).

## Quick example

```typescript
import {
  loadConfig,
  compileGuides,
  resolveDocsRoot,
  genRefsFromCompiled,
  resolveRefsPath,
  lookupHeadings,
  buildSlugRegistry,
  stripForLlm,
  getLlmExportOptions,
} from '@bwilliamson/mdcp-core';

const docsRoot = '/path/to/docs';
const config = loadConfig('mdcp.config.json', docsRoot);

const compiled = compileGuides({
  guidesRoot: resolveDocsRoot(config, docsRoot),
  compileOrder: config.compileOrder,
  banner: config.banner,
  guides: config.guides,
  docsRoot,
  config,
});

const refsPath = resolveRefsPath(docsRoot, config.outputDir, config.refs.registryFile);
genRefsFromCompiled(compiled, refsPath);

const registry = buildSlugRegistry(compiled);
const matches = lookupHeadings(registry, 'authentication');

const llmText = stripForLlm(compiled, getLlmExportOptions(config));
```

Use `writeCompiledGuides` when you need to write the monolith and per-guide publish outputs to disk.

## API — Config

| Export                                                                                 | Purpose                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `loadConfig(path, configBase)`                                                         | Load and validate `mdcp.config.json` (`path` is resolved from `configBase`) |
| `resolveOutputPath`, `resolveRefsPath`, `resolveGuideDir`, `defaultGuideOutputFile`    | Path resolvers for docs root and `outputDir`                                |
| `getGuideConfig`, `guideScanDirs`, `shardLintPaths`, `xrefScanDirs`                    | In-scope guide fileset and xref scan helpers                                |
| `MdcpConfigSchema`, `MdcpConfig`, `MdcpConfigInput`, `GuideConfig`, `GuideConfigInput` | Zod schema and types                                                        |
| `DEFAULT_COMPILE_HOOKS`, `resolveCompileHooks`                                         | Default built-in hook pipeline and guide-level resolution                   |

### Path resolution: `configBase` vs docs root

| Concern                    | Base                          | Example                                                                       |
| -------------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| Finding `mdcp.config.json` | `configBase` (invocation dir) | `--config docs/mdcp.config.json` → `<repo>/docs/mdcp.config.json`             |
| Guide shards (default)     | Docs root (`--docs-root`)     | `resolveGuideDir('features', config, docsRoot)` → `<docsRoot>/features`       |
| `outputDir`                | Docs root                     | `_build` → `<docsRoot>/_build`                                                |
| All generated paths        | `outputDir`                   | `features.md` → `<docsRoot>/_build/features.md`; `.caches/refs.json` for refs |

All generated paths use `resolveUnderOutputDir(docsRoot, outputDir, file)` — relative to `outputDir` unless `file` is absolute. Details: [API — Refs](#api-refs-and-validation).

```typescript
import { loadConfig, resolveGuideDir } from '@bwilliamson/mdcp-core';

const config = loadConfig('docs/mdcp.config.json', process.cwd());
const featuresDir = resolveGuideDir('features', config, join(process.cwd(), 'docs'));
```

Pass `process.cwd()` as `configBase` for `loadConfig`. Pass the docs root as `docsRoot` to `resolveGuideDir`, `resolveOutputPath`, and `resolveRefsPath`.

Consumer path table: [Config essentials — path layout](#path-layout).

**Defaults:** `outputDir` `_build`; per-guide outputs `{name}.md` (or `guide.md` when one guide); optional monolith when `outputFile` is set; refs at `.caches/refs.json`.

`compile.outputFile` overrides a guide's output path (relative to `outputDir` or absolute). Guides with an explicit `compile.outputFile` are excluded from an optional monolith.

`compile.includeBanner` controls whether the global banner is prepended (defaults to `false` for per-guide outputs).

`compile.publishPathRewrite` rewrites shard-relative repo paths in publish outputs. Intra-guide `./section.md` links rewrite to `#anchor` on every compile.

### `compile.hooks`

Built-in hooks run by default when `compile.hooks` is omitted. See [Default compile hooks](#default-compile-hooks).

- **Omitted** — run `DEFAULT_COMPILE_HOOKS` in order: `stripAnchors`, `codeEvidence`, `inlineInserts`
- **`string[]`** — explicit override; replaces defaults entirely (backward compatible)
- **`Record<string, boolean>`** — opt out; keys with `false` remove that hook from defaults

Optional per-hook settings: `compile.hooksConfig` (`inlineInserts.searchRoots`). Post-stitch anchor stripping: `compile.stripAnchors` (default `true`), independent of the per-shard `stripAnchors` hook unless opted out.

### `compile.crossGuideLinks`

Assembly-time cross-guide link options on the **compiling** guide (not a compile hook):

- **`ignoreGuides`** — `string[]` of guide names whose cross-guide shard links keep source `.md` paths instead of rewriting to monolith `#slug` targets

See [Cross-guide link rewriting](#cross-guide-link-rewriting) and [ignoreGuides](#ignoreguides).

## API — Compile

| Export                                            | Purpose                                              |
| ------------------------------------------------- | ---------------------------------------------------- |
| `compileGuides`, `compileGuideResults`            | Stitch shards into monolith text                     |
| `writeCompiledGuides`                             | Write monolith and publish outputs to disk           |
| `writeOutputFile`, `resolveBackupPath`            | Opt-in backup before overwrite; backup path resolver |
| `resolveBackupOptions`                            | Merge config and CLI backup settings                 |
| `WriteOutputBackupOptions`                        | Backup options type                                  |
| `sectionFiles`, `processSection`, `assembleGuide` | Lower-level assemble pipeline                        |
| `formatCompileTitle`, `extractFirstHeading`, …    | Optional `compile.title` injection and deduplication |
| `demoteHeadings`, `stripAboutThisGuideHeading`, … | Heading transforms                                   |
| `registerCompileHook`, `applyCompileHooks`        | Extension hooks (`stripAnchors`, `inlineInserts`, …) |

`compileGuides` returns monolith text only — guides with `compile.outputFile` are excluded. `writeCompiledGuides` writes both the monolith and any publish targets.

`writeOutputFile` writes compile or export targets. Default: overwrite. When `backup.enabled` is true, moves an existing file to `{outputDir}/{backupDir}/{docsRoot-relative-key}{ext}` before writing. Pass `backup` on `CompileOptions` or resolve via `resolveBackupOptions(config, cliOverrides)`.

When `compile.title` is set, `assembleGuide` injects a `##` heading followed by a blank line before the first section. See [API — Config](#api-config) for per-guide compile fields and top-level `backup` config.

Full spec: [Compile output backup](#compile-output-backup).

## API — Refs and validation

### Refs (cross-links)

| Export                                                         | Purpose                    |
| -------------------------------------------------------------- | -------------------------- |
| `buildSlugRegistry`, `lookupHeadings`, `githubSlugify`         | GitHub-style heading slugs |
| `genRefsFromCompiled`, `readRefsRegistry`, `checkRefsRegistry` | `refs.json` lifecycle      |
| `resolveRefsPath`, `writeRefsRegistry`                         | Path and I/O helpers       |

#### `resolveRefsPath(docsRoot, outputDir, registryFile)`

Resolves the on-disk path for the refs registry. Implemented via the same `outputDir`-relative helper as `resolveOutputPath`. Pass the docs root (the CLI `--docs-root` value).

- `outputDir` is relative to `docsRoot`.
- `registryFile` is relative to `outputDir` (default `.caches/refs.json`).

```typescript
resolveRefsPath('/docs', '_build', '.caches/refs.json');
// → /docs/_build/.caches/refs.json

resolveRefsPath('/docs', '.', 'refs.json');
// → /docs/refs.json
```

Prefer outputDir-relative values in config (for example `".caches/refs.json"` when `outputDir` is `"_build"`). See [Config essentials — path layout](#path-layout).

### Manifest

| Export                          | Purpose                                        |
| ------------------------------- | ---------------------------------------------- |
| `sectionFiles`, `assembleGuide` | Resolve compile order from manifest link order |

### Validation

| Export                                  | Purpose                                 |
| --------------------------------------- | --------------------------------------- |
| `checkOrphans`, `checkOrphansForGuides` | Detect unlinked or missing shard files  |
| `lintXrefs`                             | Chapter-style cross-reference detection |

## API — Export, shard, and peers

### Export

| Export                               | Purpose                           |
| ------------------------------------ | --------------------------------- |
| `stripForLlm`, `getLlmExportOptions` | Token-optimized output for agents |

### Shard (split)

| Export                           | Purpose                                 |
| -------------------------------- | --------------------------------------- |
| `shardFromMonolith`, `runMdTree` | Split a monolith into guide directories |

### Peer tools

| Export                      | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `findPeerBinary`, `runPeer` | Locate and run host-repo linters (`markdownlint-cli2`, `vale`, …) |

Peer linters are not bundled. Detection order: `node_modules/.bin` → PATH → skip with info.

## Compile hooks

Per-shard transforms run during `assembleGuide` **before** sections are stitched. Hooks receive each shard body after heading demotion and preamble stripping; assembly-time passes (cross-guide rewrite, anchor stripping, intra-guide rewrite, optional `publishPathRewrite`) run around the hook pipeline.

Hooks assemble [authored GFM](#gfm) — not variable substitution or template logic. See [Preprocessor / templating (out of scope)](#preprocessor-templating-out-of-scope).

### Architecture

```text
assembleGuide (per guide)
  │
  ├─ for each manifest shard (in order)
  │    ├─ processSection (demote headings, strip about-this-guide)
  │    ├─ applyCompileHooks (named hooks from config, in order)
  │    └─ rewriteCrossGuideFileLinks (automatic when link index present)
  │
  └─ stitch → stripAnchors (default) → intra-guide .md → publishPathRewrite
```

**Guide link index** — built once per `compileGuideResults` from every guide in `compileOrder` (manifest sections plus transitively linked shards). Used by the automatic cross-guide pass. Optional `compile.crossGuideLinks.ignoreGuides` on the compiling guide skips monolith rewrite for listed targets. See [Cross-guide link rewriting](#cross-guide-link-rewriting).

**Per-guide hook state** — mutable `hookState` on `CompileHookContext` (for example `inlineInserts` counters and first-anchor map) shared across shard invocations within one guide compile.

**Path resolution** — most hooks resolve relative paths from `dirname(sourceFile)` (the current shard), then parent, then `compile.scopeRoot`, then cwd. Rebasing for rendered output uses `outputFile` / monolith path via `resolveGuideLinkBase`.

### Extension pattern

Register custom hooks in consumer or library code:

```typescript
import { registerCompileHook } from '@bwilliamson/mdcp-core';

registerCompileHook('myHook', (ctx) => {
  return ctx.body.replace(/TODO/g, 'DONE');
});
```

Custom hooks are **not** in the default pipeline — list them explicitly in `compile.hooks` when needed.

Hook implementations should be **pure on `ctx.body`** except when intentionally using shared `hookState`. Leave unmatched links unchanged. Prefer docs-first specs with tests mapped to spec sections (see each hook shard below).

### Configuration

Built-in hooks run **by default**. Omit `compile.hooks` for the common case. Optional per-hook config lives under `guides[].compile.hooksConfig`.

```json
{
  "name": "glossary",
  "compile": {
    "scopeRoot": ".",
    "outputFile": "glossary.md",
    "hooksConfig": {
      "inlineInserts": { "searchRoots": ["diagrams"] }
    }
  }
}
```

Optional assembly-time cross-guide exceptions: `compile.crossGuideLinks.ignoreGuides` on the compiling guide — see [Cross-guide link rewriting](#cross-guide-link-rewriting).

#### Opt out per hook

Disable specific defaults with an object on `compile.hooks` (`false` removes a hook):

```json
{
  "compile": {
    "hooks": { "inlineInserts": false }
  }
}
```

#### Explicit override

Replace the entire default pipeline with a string array (backward compatible):

```json
{
  "compile": {
    "hooks": ["stripAnchors", "codeEvidence"]
  }
}
```

Default hook order and behavior: [Default compile hooks](#default-compile-hooks). Config API: [API — Config](#api-config).

For manifest compile order and `compile.sectionsHeading`, see [Manifest compile order](#manifest-compile-order).

### Built-in hooks

- **`stripAnchors`** — per shard (also default post-stitch). Removes explicit anchor markers.
- **`codeEvidence`** — per shard. [codeEvidence](#codeevidence): repo source links → `#L` fragments.
- **`inlineInserts`** — per shard. [inlineInserts](#inlineinserts): inline captioned insert libraries.
- **Cross-guide rewrite** _(assembly)_ — per shard before stitch. [Cross-guide links](#cross-guide-link-rewriting): automatic from `compileOrder`; optional `crossGuideLinks.ignoreGuides`.

`stripAnchors` is also controlled by `compile.stripAnchors` (default `true`) after assembly.

## codeEvidence

Specification for the `codeEvidence` compile hook. Tests in `packages/mdcp-core/test/code-evidence.test.ts` map to the sections below (docs first, then TDD).

### codeEvidence purpose

Architecture and technical review shards cite **repo source files** as evidence. At compile time, the hook:

1. Resolves **line ranges** from link text (for example `L6-L8`, `lines 12–15`, `:42`)
2. Resolves **symbols** from the URL fragment (`file.ts#symbol`) or from the link label when no fragment is present (for example ``[`orgCount`](../../functions/src/foo.ts)``)
3. Appends GitHub-style **`#L` fragments** (`#L6`, `#L6-L8`) to the link target
4. Rewrites the target path to be **relative to the rendered output** — the per-guide `compile.outputFile` when set, otherwise the monolith path (`outputDir` + `outputFile` from config)

Pair with `compile.publishPathRewrite` when publish outputs need repo-root path normalization (for example `../../package.json` → `package.json`).

### codeEvidence link matching

A link is rewritten when **all** of the following hold:

- Standard markdown link syntax: `[label](path)`
- Target path is a **source file** (common extensions such as `.ts`, `.py`, `.go`, or extensionless paths like `Makefile`)
- Target is not `http://`, `https://`, or `#…`

Markdown (`.md`) links, external URLs, and same-guide shard links are left unchanged.

### codeEvidence line ranges

Line ranges are parsed from the **link label** first, then from the path (before any `#` fragment). Supported forms:

| Form in label or path | Fragment           |
| --------------------- | ------------------ |
| `L6-L8`, `L6–L8`      | `#L6-L8`           |
| `L42`, `line 42`      | `#L42`             |
| `:10-20`, `:10`       | `#L10-L20`, `#L10` |

If the URL already has a normalized `#L…` fragment, the hook preserves it (normalizing case to `#L`).

### codeEvidence symbols

When no line range is found:

1. If the URL has a `#fragment` that is not already `#L…`, treat the fragment as a **symbol name** and scan the resolved source file for a matching declaration or reference.
2. Otherwise, treat the **link label** as the symbol (backticks and surrounding whitespace stripped).

Symbol lookup scans for identifier matches and common declaration forms (`function`, `class`, `const`, `export`, call sites).

### codeEvidence path resolution

Source file lookup order:

1. Relative to the current shard directory
2. Relative to the shard parent directory
3. `process.cwd()` and its parent
4. `compile.scopeRoot` (when set on the guide — same field used for manifest scoping)

When a source file is resolved, the hook rewrites the link target to a POSIX path **relative to the rendered output document**, preserving any `#L…` fragment added by the hook. No hook-specific config is required: shard-relative paths in source are resolved as written, then rebased for where the compiled file lands.

### codeEvidence exclusions

The hook **does not** transform:

- Markdown shard links (`.md`)
- External URLs
- Source links when the file cannot be resolved and no line range appears in label or path
- Body text when `codeEvidence` is disabled via `compile.hooks: { "codeEvidence": false }` or an explicit hook override that omits it

### codeEvidence config

Runs by default — no hook list required. Path rewriting uses the monolith or per-guide output path automatically:

```json
{
  "name": "architecture-review",
  "compile": {}
}
```

When the guide publishes to its own file instead of the monolith, set `compile.outputFile` (paths are rebased to that file). When shards link across directories outside the guide tree, set `compile.scopeRoot` (typically `"."` for repo root) so manifest scoping and evidence lookup share one root:

```json
{
  "name": "architecture-review",
  "compile": {
    "scopeRoot": ".",
    "outputFile": "architecture-review.md"
  }
}
```

Opt out: `"hooks": { "codeEvidence": false }`. See [Default compile hooks](#default-compile-hooks).

### codeEvidence compile example

Shard input (under `review/claim.md`):

```markdown
Evidence: [`orgCount`](../../functions/src/foo.ts)

See [firestore.rules L6-L8](../../firestore.rules#L6-L8).
```

Compiled output (when `functions/src/foo.ts` defines `orgCount` on line 6 and output is `architecture-review.md` at repo root):

```markdown
Evidence: [`orgCount`](functions/src/foo.ts#L6)

See [firestore.rules L6-L8](firestore.rules#L6-L8).
```

## inlineInserts

Specification for the `inlineInserts` compile hook. Tests in `packages/mdcp-core/test/inline-inserts.test.ts` map to the sections below (docs first, then TDD).

### inlineInserts purpose

Guides link to **captioned insert shards** (`.md` files) in typed libraries under the docs root. Shard bodies may be markdown tables, prose, or **media embeds** (images, video, audio). At compile time, the hook:

1. Inlines insert markdown at the **first** link (per guide, per file)
2. Adds a numbered **`####` heading** (GFM only — no HTML, no directives)
3. Rewrites **later** links to the same file as markdown back-links (`[label](#slug)`)

### inlineInserts layout

One library directory per insert type (library-science convention):

```text
docs/
  diagrams/              # flow charts, sequence diagrams (markdown tables or images)
  tables/                # reference tables, comparison matrices
  figures/               # screenshots, static diagrams
  media/                 # video, audio, and other captioned media embeds
  inserts/               # optional generic captioned blocks
  review/
    insert-catalog.md    # links to ../diagrams/…, ../tables/…, ../figures/…, ../media/…
```

Link targets are always `.md` insert shards. Put binary assets alongside the shard (or under the same library) and reference them from the shard body — for example `![Overview](./component-map.png)` or an HTML `<video>` / `<audio>` block when your renderer supports it.

Shards link with normal markdown — no `<!-- directives -->`.

### inlineInserts link matching

A link is an insert reference when **all** of the following hold:

- Standard markdown link syntax: `[label](path)`
- Target path contains `diagram`, `diagrams`, `table`, `tables`, `figure`, `figures`, `media`, `insert`, or `inserts`
- Target ends in `.md` (optional `#fragment` suffix is ignored for file lookup)
- Target is not `http://` or `https://`

### inlineInserts exclusions

The hook **does not** transform:

- Regular shard links (for example `./intro.md`, `../glossary/term.md`)
- Direct links to binary assets (for example `../figures/architecture.png`, `../figures/demo.mp4`) — use a captioned `.md` insert shard that embeds the media instead
- External URLs, even when the path contains `diagrams/`
- Links to missing insert files (left unchanged)
- Body text when `inlineInserts` is disabled via `compile.hooks: { "inlineInserts": false }` or an explicit hook override that omits it

### inlineInserts first inline

The first reference to an insert file (document order across all shards in the guide) is replaced with:

```markdown
#### {Kind} {n}. {caption}

{insert shard body — tables, prose, images, video, audio, …}
```

- **Kind** — `Diagram`, `Table`, `Figure`, `Media`, or `Insert` (from parent library directory)
- **n** — serial number for that kind in this guide (see **Numbered captions** below)
- **caption** — link label, or a humanized basename when the label is empty
- **Anchor slug** — GitHub-style slug of the full heading (for example `Table 1. Status codes` → `#table-1-status-codes`)

Output uses GFM headings and back-links for captions. Inlined shard bodies pass through as written (markdown tables, `![images](…)`, or HTML `<video>` / `<audio>` when your renderer supports them).

### inlineInserts numbered captions

Serial counters are **per insert kind** and **per guide compile**:

| Kind    | First inline heading example   | Second inline (same kind) |
| ------- | ------------------------------ | ------------------------- |
| diagram | `#### Diagram 1. Request flow` | `#### Diagram 2. …`       |
| table   | `#### Table 1. Status codes`   | `#### Table 2. …`         |
| figure  | `#### Figure 1. Component map` | `#### Figure 2. …`        |
| media   | `#### Media 1. Walkthrough`    | `#### Media 2. …`         |

Rules:

- Diagram and table counters are independent (`Diagram 1` then `Table 1` then `Diagram 2` is valid)
- Counters continue across shards via shared per-guide hook state
- Each guide starts at 1 for each kind (two guides sharing one insert file each get their own `Diagram 1`)
- Repeat links to an **already inlined file** do not consume a new number (back-link only)

### inlineInserts deduplication

Within one guide:

- First link to `../diagrams/flow.md` → inline under numbered heading
- Later links to the same resolved file (any path spelling, with or without `#fragment`) → `[label](#diagram-1-…)`
- Same basename in different libraries (`diagrams/overview.md` vs `tables/overview.md`) → separate headings and anchors

### inlineInserts path resolution

Lookup order for insert shard paths:

1. Relative to the current shard directory
2. Relative to the shard parent directory
3. `process.cwd()` and its parent
4. Optional `hooksConfig.inlineInserts.searchRoots`

### inlineInserts config

Runs by default. Optional search roots:

```json
{
  "name": "architecture-review",
  "compile": {
    "hooksConfig": {
      "inlineInserts": { "searchRoots": ["diagrams"] }
    }
  }
}
```

Opt out: `"hooks": { "inlineInserts": false }`. See [Default compile hooks](#default-compile-hooks).

### inlineInserts compile example

Shard input:

```markdown
| Insert                                      | Summary     |
| ------------------------------------------- | ----------- |
| [Request flow](../diagrams/request-flow.md) | Client path |

See [Request flow](../diagrams/request-flow.md) again in prose.
```

Compiled fragment (first guide mention):

```markdown
| Insert | Summary |
| ------ | ------- |

|

#### Diagram 1. Request flow

| Step | Actor  |
| ---- | ------ |
| 1    | Client |

| Client path |

See [Request flow](#diagram-1-request-flow) again in prose.
```

Example fixture: [`examples/sample-guides/inserts-demo/`](../../../examples/sample-guides/inserts-demo/). See [GitHub media reference](#github-markdown-media-reference) for a format matrix (PNG, JPEG, GIF, SVG, MP4, MP3/WAV, Mermaid, tables, lists) and minimal generated sample assets under `figures/` and `media/`.

**Figure with embedded image** — shard `figures/component-map.md`:

```markdown
![Component map overview](./component-map.png)
```

Catalog link `[Component map](../figures/component-map.md)` compiles to a numbered `#### Figure 1. …` heading followed by that image markdown.

**Media with embedded video** — shard `media/walkthrough.md`:

```markdown
<video src="./walkthrough.mp4" controls></video>
```

Catalog link `[Walkthrough](../media/walkthrough.md)` compiles to `#### Media 1. Walkthrough` followed by the video embed.

## Cross-guide link rewriting

Specification for assembly-time cross-shard and cross-guide link rewriting. Tests in `packages/mdcp-core/test/cross-guide-links.test.ts` map to the sections below (docs first, then TDD).

Multi-output consumer repos compile separate monoliths (for example `glossary.md`, `architecture-review.md`, `technical-guide.md`) from shards that span `review/`, `security/`, `features/`, and sibling guide directories. Source shards link with relative `.md` paths; compiled output must use stable in-document or cross-monolith `#slug` targets so link-fragment lint passes.

### Cross-guide purpose

At compile time, MDCP:

1. Builds a **guide link index** from every guide in `compileOrder` — each manifest-listed shard maps to its compiled `{guideName, outputBasename, slug}` (slug from the demoted first heading, same rules as intra-guide rewrite), plus shards linked transitively from section bodies
2. Rewrites **cross-guide** `.md` links per shard (using the shard path for relative resolution) before sections are stitched
3. Rewrites **same-guide** `./section.md` links on the assembled body (intra-guide pass)

This is an **assembly-time pass**, not a compile hook. Pair with `compile.publishPathRewrite` when publish outputs also need repo-root path normalization for non-markdown targets.

### Cross-guide link matching

A link is rewritten when **all** of the following hold:

- Standard markdown link syntax: `[label](path)`
- Target path ends in `.md` (optional `#fragment`)
- Target is not `http://`, `https://`, or `#…`
- Target resolves to a shard registered in the guide link index
- Target shard's guide is **not** listed in `compile.crossGuideLinks.ignoreGuides` on the compiling guide

Same-guide `./section.md` links are handled by the intra-guide pass after assembly; cross-guide rewrite handles `../` and repo-scoped paths that point at another guide's shards.

### Cross-guide resolution

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
| Target guide in `ignoreGuides`                   | **unchanged** — keep source `.md` path (link to shard, not monolith)    |

Finding shards (`FIND-*.md`) use the finding id from the filename (for example `#find-004`), not the parent outcomes section slug.

### Cross-guide exclusions

The pass **does not** transform:

- External URLs
- Same-document `#fragment` links
- Markdown links that do not resolve to an indexed shard
- Non-markdown paths (handled by `codeEvidence` or left unchanged)
- Links to shards in guides listed in `compile.crossGuideLinks.ignoreGuides`

### Cross-guide config

Minimal multi-output setup — index and rewrite run automatically from `compileOrder` and per-guide `compile.outputFile`:

```json
{
  "outputDir": "_build/compiled",
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
    },
    {
      "name": "technical-guide",
      "path": "technical",
      "compile": {
        "scopeRoot": ".",
        "outputFile": "technical-guide.md"
      }
    }
  ]
}
```

#### `compile.crossGuideLinks.ignoreGuides`

Set on the **guide being compiled**. Guide names in this list keep source `.md` paths for cross-guide links instead of rewriting to that guide's monolith `#slug` target ([ignoreGuides](#ignoreguides)). Use when one compiled guide should link to live shard files for specific guides (for example technical reference docs that are not folded into a review bundle).

```json
{
  "name": "glossary",
  "compile": {
    "outputFile": "glossary.md",
    "crossGuideLinks": {
      "ignoreGuides": ["technical-guide"]
    }
  }
}
```

### Cross-guide compile example

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

### Cross-guide multi-target (three guides)

When one guide links to shards in **two or more** other guides, each link rewrites to that shard's own `compile.outputFile` independently.

Hub shard input (`glossary/terms.md`):

```markdown
## Terms

See [FIND-004](../review/outcomes/FIND-004.md) and [Deployment](../technical/deployment.md).
```

Compiled `glossary.md` (each target keeps its guide output):

```markdown
## Terms

See [FIND-004](architecture-review.md#find-004) and [Deployment](technical-guide.md#deployment).
```

### Cross-guide ignore example (mixed monolith and shard links)

Same hub shard with `ignoreGuides: ["technical-guide"]` on the **glossary** guide:

```markdown
## Terms

See [FIND-004](architecture-review.md#find-004) and [Deployment](../technical/deployment.md).
```

Review targets use the compiled monolith; ignored guides keep shard paths. Tests in `packages/mdcp-core/test/cross-guide-links.test.ts` cover index entries, per-link routing, `ignoreGuides`, and end-to-end compile.

## Related packages

| Package                                                                                | Use                           |
| -------------------------------------------------------------------------------------- | ----------------------------- |
| [`@bwilliamson/mdcp-cli`](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)         | `mdcp` command-line interface |
| [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) | Starter markdownlint configs  |

### Further reading

- [Project README](#changesets)
- [Design constraints](#developer-guide-1)
- [CLI package docs](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)

### License

MIT
