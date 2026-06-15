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

## API — Compile

| Export                                            | Purpose                                              |
| ------------------------------------------------- | ---------------------------------------------------- |
| `compileGuides`, `compileGuideResults`            | Stitch shards into monolith text                     |
| `writeCompiledGuides`                             | Write monolith and publish outputs to disk           |
| `sectionFiles`, `processSection`, `assembleGuide` | Lower-level assemble pipeline                        |
| `formatCompileTitle`, `extractFirstHeading`, …    | Optional `compile.title` injection and deduplication |
| `demoteHeadings`, `stripAboutThisGuideHeading`, … | Heading transforms                                   |
| `registerCompileHook`, `applyCompileHooks`        | Extension hooks (`stripAnchors`, `inlineInserts`, …) |

`compileGuides` returns monolith text only — guides with `compile.outputFile` are excluded. `writeCompiledGuides` writes both the monolith and any publish targets.

When `compile.title` is set, `assembleGuide` injects a `##` heading followed by a blank line before the first section. See [API — Config](#api-config) for per-guide compile fields.

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

Per-shard transforms run during `assembleGuide` **before** sections are stitched. Hooks receive each shard body after heading demotion and preamble stripping; assembly-time passes (anchor stripping, cross-guide rewrite, intra-guide rewrite, optional `publishPathRewrite`) run after all hooks complete.

**Not general templating:** hooks rewrite links, inline captioned inserts, and apply other documentation-specific assembly on **already-authored [GFM](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/glossary.md#gfm)**. They do not substitute `{{variables}}`, evaluate `{% if %}` blocks, or replace a template engine. For that, run a preprocessor before shards are committed or a postprocessor after compile — see [Preprocessor / templating (out of scope)](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/design-constraints.md#preprocessor-templating-out-of-scope).

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

**Guide link index** — built once per `compileGuideResults` from every guide in `compileOrder` (manifest sections plus transitively linked shards). Passed into hook context and the automatic cross-guide pass. See [Cross-guide link rewriting](#cross-guide-link-rewriting).

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

List hook names in `mdcp.config.json` under `guides[].compile.hooks` (order matters). Optional per-hook config lives under `guides[].compile.hooksConfig`.

Hook implementations should be **pure on `ctx.body`** except when intentionally using shared `hookState`. Leave unmatched links unchanged. Prefer docs-first specs with tests mapped to spec sections (see each hook shard below).

### Configuration

```json
{
  "name": "architecture-review",
  "compile": {
    "scopeRoot": ".",
    "outputFile": "architecture-review.md",
    "hooks": ["stripAnchors", "codeEvidence", "inlineInserts"],
    "hooksConfig": {
      "inlineInserts": { "searchRoots": ["diagrams"] },
      "reviewLinks": { "targetMonolith": "architecture-review.md" }
    }
  }
}
```

For manifest compile order and `compile.sectionsHeading`, see [Manifest compile order](#manifest-compile-order).

### Built-in hooks

- **`stripAnchors`** — per shard (also default post-stitch). Removes explicit anchor markers.
- **`codeEvidence`** — per shard. [codeEvidence](#codeevidence): repo source links → `#L` fragments.
- **`inlineInserts`** — per shard. [inlineInserts](#inlineinserts): inline captioned insert libraries.
- **Cross-guide rewrite** _(assembly)_ — per shard + post-stitch. [Cross-guide links](#cross-guide-link-rewriting): automatic from `compileOrder`.
- **`reviewLinks`** — per shard (optional). [reviewLinks](#reviewlinks): `targetMonolith` override for cross-guide targets.

`stripAnchors` is also controlled by `compile.stripAnchors` (default `true`) after assembly. Cross-guide rewrite runs automatically for multi-output layouts; add `reviewLinks` only when forcing all cross-links onto one output file.

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
- Body text when `codeEvidence` is not in `compile.hooks`

### codeEvidence config

Minimal setup — add the hook name. Path rewriting uses the monolith or per-guide output path automatically:

```json
{
  "name": "architecture-review",
  "compile": {
    "hooks": ["stripAnchors", "codeEvidence"]
  }
}
```

When the guide publishes to its own file instead of the monolith, set `compile.outputFile` (paths are rebased to that file). When shards link across directories outside the guide tree, set `compile.scopeRoot` (typically `"."` for repo root) so manifest scoping and evidence lookup share one root:

```json
{
  "name": "architecture-review",
  "compile": {
    "scopeRoot": ".",
    "outputFile": "architecture-review.md",
    "hooks": ["stripAnchors", "codeEvidence"]
  }
}
```

### codeEvidence compile example

Shard input (under `review/claim.md`):

```markdown
Evidence: [`orgCount`](../../functions/src/foo.ts)

See [firestore.rules L6-L8](../../firestore.rules).
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
- Body text when `inlineInserts` is not in `compile.hooks`

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

```json
{
  "name": "architecture-review",
  "compile": {
    "hooks": ["stripAnchors", "inlineInserts", "reviewLinks"],
    "hooksConfig": {
      "inlineInserts": { "searchRoots": ["diagrams"] }
    }
  }
}
```

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

Example fixture: [`examples/sample-guides/inserts-demo/`](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides/inserts-demo). See [GitHub media reference](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/inserts-demo/github-media-help.md) for a format matrix (PNG, JPEG, GIF, SVG, MP4, MP3/WAV, Mermaid, tables, lists) and minimal generated sample assets under `figures/` and `media/`.

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

1. Builds a **guide link index** from every guide in `compileOrder` — each manifest-listed shard maps to its compiled `{outputBasename, slug}` (slug from the demoted first heading, same rules as intra-guide rewrite), plus shards linked transitively from section bodies
2. Rewrites **cross-guide** `.md` links per shard (using the shard path for relative resolution) before sections are stitched
3. Rewrites **same-guide** `./section.md` links on the assembled body (intra-guide pass)

Pair with `compile.publishPathRewrite` when publish outputs also need repo-root path normalization for non-markdown targets.

### Cross-guide link matching

A link is rewritten when **all** of the following hold:

- Standard markdown link syntax: `[label](path)`
- Target path ends in `.md` (optional `#fragment`)
- Target is not `http://`, `https://`, or `#…`
- Target resolves to a shard registered in the guide link index

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

Finding shards (`FIND-*.md`) use the finding id from the filename (for example `#find-004`), not the parent outcomes section slug.

### Cross-guide exclusions

The pass **does not** transform:

- External URLs
- Same-document `#fragment` links
- Markdown links that do not resolve to an indexed shard
- Non-markdown paths (handled by `codeEvidence` or left unchanged)

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
    }
  ]
}
```

Optional **`reviewLinks`** hook — same rewrite rules with an explicit override when every cross-guide link should target one monolith file (`hooksConfig.reviewLinks.targetMonolith`). Prefer assembly-time index rewrite when guides map to separate outputs; use `targetMonolith` for legacy single-file review layouts. See [reviewLinks](#reviewlinks).

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

## reviewLinks

Optional compile hook that delegates to the same cross-guide rewrite engine as the automatic assembly pass. Tests in `packages/mdcp-core/test/builtin-hooks.test.ts` cover the `targetMonolith` override.

Add to `compile.hooks` when you need **`hooksConfig.reviewLinks.targetMonolith`** to force all resolved cross-guide links onto one output file (legacy consumer monoliths).

```json
{
  "name": "glossary",
  "compile": {
    "hooks": ["stripAnchors", "reviewLinks"],
    "hooksConfig": {
      "reviewLinks": { "targetMonolith": "architecture-review.md" }
    }
  }
}
```

When `targetMonolith` is set, indexed targets in other outputs are rewritten to `{targetMonolith}#slug` instead of their native `outputFile`. When omitted, the hook uses the guide link index (same behavior as the automatic per-shard pass).

For index building, resolution rules, and multi-output layouts, see [Cross-guide link rewriting](#cross-guide-link-rewriting).

## Related packages

| Package                                                                                | Use                           |
| -------------------------------------------------------------------------------------- | ----------------------------- |
| [`@bwilliamson/mdcp-cli`](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)         | `mdcp` command-line interface |
| [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) | Starter markdownlint configs  |

### Further reading

- [Project README](https://github.com/betsalel-williamson/mdcp#readme)
- [Design constraints](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/design-constraints.md)
- [CLI package docs](https://www.npmjs.com/package/@bwilliamson/mdcp-cli)

### License

MIT
