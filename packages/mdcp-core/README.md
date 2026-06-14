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
  resolveGuidesRoot,
  genRefsFromCompiled,
  resolveRefsPath,
  lookupHeadings,
  buildSlugRegistry,
  stripForLlm,
  getLlmExportOptions,
} from '@bwilliamson/mdcp-core';

const cwd = '/path/to/docs';
const config = loadConfig('mdcp.config.json', cwd);

const compiled = compileGuides({
  guidesRoot: resolveGuidesRoot(config, cwd),
  compileOrder: config.compileOrder,
  banner: config.banner,
  guides: config.guides,
  cwd,
  config,
});

const refsPath = resolveRefsPath(cwd, config.outputDir, config.refs.registryFile);
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
| `resolveOutputPath`, `resolveRefsPath`, `resolveGuidesRoot`, `resolveGuideDir`         | Path resolvers for outputDir-relative config fields                         |
| `getGuideConfig`, `xrefScanDirs`                                                       | Per-guide and xref scan helpers                                             |
| `MdcpConfigSchema`, `MdcpConfig`, `MdcpConfigInput`, `GuideConfig`, `GuideConfigInput` | Zod schema and types                                                        |

### Path resolution: `configBase` vs docs root

The CLI and core library use **separate path bases**:

| Concern                               | Base directory                                       | Example                                                                          |
| ------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Finding `mdcp.config.json`            | `configBase` — invocation `process.cwd()` in the CLI | `--config docs/mdcp.config.json` from repo root → `<repo>/docs/mdcp.config.json` |
| `guides[].path`, `compile.outputFile` | Docs root — `--cwd`                                  | `resolveGuideDir('features', config, cwd)` → `<cwd>/features`                    |
| `outputDir`                           | Docs root — `--cwd`                                  | `resolveGuidesRoot(config, cwd)` → `<cwd>/<outputDir>`                           |
| `outputFile`, `refs.registryFile`     | `outputDir` (under docs root)                        | `resolveOutputPath(config, cwd)` → `<cwd>/<outputDir>/guides.md`                 |

`resolveOutputPath` and `resolveRefsPath` both use the same `outputDir`-relative rule and normalize cwd-relative values that already fall under `outputDir`. Details: [API — Refs](#api-refs-and-validation).

```typescript
import { loadConfig, resolveGuideDir } from '@bwilliamson/mdcp-core';

// Repo-root script: config at docs/mdcp.config.json, shards under docs/
const config = loadConfig('docs/mdcp.config.json', process.cwd());
const featuresDir = resolveGuideDir('features', config, join(process.cwd(), 'docs'));
```

Pass `process.cwd()` (or the invocation directory) as `configBase` for `loadConfig`. Pass the docs root as the `cwd` argument to `resolveGuideDir`, `resolveOutputPath`, `resolveGuidesRoot`, and `resolveRefsPath`.

Consumer path table: [Config essentials — path bases](../client-cli/config-essentials.md#config-path-bases).

Per-guide `compile.outputFile` writes a publish target and excludes that guide from the monolith. `compile.includeBanner` controls whether the global banner is prepended (defaults to `false` when `outputFile` is set).

`compile.title` injects a `##` heading at the start of the assembled guide, separated from the first section by a blank line. When the first shard’s top heading matches the title text, that duplicate heading is stripped before assembly.

`compile.publishPathRewrite` optionally rewrites shard-relative repo paths in publish outputs (for example `../../package.json` → `package.json` and `../features/foo.md` → `docs/features/foo.md`). Intra-guide `./section.md` links are rewritten to in-document `#anchor` links on **every** compile, including monolith output.

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

#### `resolveRefsPath(cwd, outputDir, registryFile)`

Resolves the on-disk path for the refs registry. Implemented via the same `outputDir`-relative helper as `resolveOutputPath`. Pass the docs root as `cwd` (the CLI `--cwd` value).

- `outputDir` is relative to `cwd`.
- `registryFile` is relative to `outputDir` (not `cwd`).

```typescript
resolveRefsPath('/docs', '_build/compiled', 'refs.json');
// → /docs/_build/compiled/refs.json

resolveRefsPath('/docs', '.', 'refs.json');
// → /docs/refs.json
```

If `registryFile` or monolith `outputFile` is accidentally given as a cwd-relative path that already falls under `outputDir`, MDCP uses the cwd-relative interpretation so the path is not joined twice:

```typescript
resolveRefsPath('/docs', '_build/compiled', '_build/compiled/refs.json');
// → /docs/_build/compiled/refs.json (normalized)
```

Prefer outputDir-relative values in config (for example `"refs.json"` when `outputDir` is `"_build/compiled"`). See [Config essentials — path bases](../client-cli/config-essentials.md#config-path-bases).

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

Register custom per-shard transforms:

```typescript
import { registerCompileHook } from '@bwilliamson/mdcp-core';

registerCompileHook('myHook', (ctx) => {
  return ctx.body.replace(/TODO/g, 'DONE');
});
```

Built-in hook names are configured in `mdcp.config.json` under `guides[].compile.hooks`:

- **`stripAnchors`** — removes explicit `` markers per shard
- **`codeEvidence`** — rewrites Evidence / source-file links to `#L` line fragments (see [codeEvidence](#codeevidence) below)
- **`inlineInserts`** — inlines captioned insert shards (diagrams, tables, figures, media) from shared libraries
- **`reviewLinks`** — rewrites finding and cross-guide links for monolith cohesion (`hooksConfig.reviewLinks.targetMonolith`)

Optional hook config under `guides[].compile.hooksConfig`. For manifest compile order and `compile.sectionsHeading`, see [Manifest compile order](../features/manifest-compile-order.md).

### codeEvidence

Specification for the `codeEvidence` compile hook. Tests in `packages/mdcp-core/test/code-evidence.test.ts` map to the sections below (docs first, then TDD).

#### codeEvidence purpose

Architecture and technical review shards cite **repo source files** as evidence. At compile time, the hook:

1. Resolves **line ranges** from link text (for example `L6-L8`, `lines 12–15`, `:42`)
2. Resolves **symbols** from the URL fragment (`file.ts#symbol`) or from the link label when no fragment is present (for example ``[`orgCount`](../../functions/src/foo.ts)``)
3. Appends GitHub-style **`#L` fragments** (`#L6`, `#L6-L8`) to the link target
4. Rewrites the target path to be **relative to the rendered output** — the per-guide `compile.outputFile` when set, otherwise the monolith path (`outputDir` + `outputFile` from config)

Pair with `compile.publishPathRewrite` when publish outputs need repo-root path normalization (for example `../../package.json` → `package.json`).

#### codeEvidence link matching

A link is rewritten when **all** of the following hold:

- Standard markdown link syntax: `[label](path)`
- Target path is a **source file** (common extensions such as `.ts`, `.py`, `.go`, or extensionless paths like `Makefile`)
- Target is not `http://`, `https://`, or `#…`

Markdown (`.md`) links, external URLs, and same-guide shard links are left unchanged.

#### codeEvidence line ranges

Line ranges are parsed from the **link label** first, then from the path (before any `#` fragment). Supported forms:

| Form in label or path | Fragment           |
| --------------------- | ------------------ |
| `L6-L8`, `L6–L8`      | `#L6-L8`           |
| `L42`, `line 42`      | `#L42`             |
| `:10-20`, `:10`       | `#L10-L20`, `#L10` |

If the URL already has a normalized `#L…` fragment, the hook preserves it (normalizing case to `#L`).

#### codeEvidence symbols

When no line range is found:

1. If the URL has a `#fragment` that is not already `#L…`, treat the fragment as a **symbol name** and scan the resolved source file for a matching declaration or reference.
2. Otherwise, treat the **link label** as the symbol (backticks and surrounding whitespace stripped).

Symbol lookup scans for identifier matches and common declaration forms (`function`, `class`, `const`, `export`, call sites).

#### codeEvidence path resolution

Source file lookup order:

1. Relative to the current shard directory
2. Relative to the shard parent directory
3. `process.cwd()` and its parent
4. `compile.scopeRoot` (when set on the guide — same field used for manifest scoping)

When a source file is resolved, the hook rewrites the link target to a POSIX path **relative to the rendered output document**, preserving any `#L…` fragment added by the hook. No hook-specific config is required: shard-relative paths in source are resolved as written, then rebased for where the compiled file lands.

#### codeEvidence exclusions

The hook **does not** transform:

- Markdown shard links (`.md`)
- External URLs
- Source links when the file cannot be resolved and no line range appears in label or path
- Body text when `codeEvidence` is not in `compile.hooks`

#### codeEvidence config

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

#### codeEvidence compile example

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

### inlineInserts

Specification for the `inlineInserts` compile hook. Tests in `packages/mdcp-core/test/inline-inserts.test.ts` map to the sections below (docs first, then TDD).

#### Purpose

Guides link to **captioned insert shards** (`.md` files) in typed libraries under the docs root. Shard bodies may be markdown tables, prose, or **media embeds** (images, video, audio). At compile time, the hook:

1. Inlines insert markdown at the **first** link (per guide, per file)
2. Adds a numbered **`####` heading** (GFM only — no HTML, no directives)
3. Rewrites **later** links to the same file as markdown back-links (`[label](#slug)`)

#### Layout

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

#### Link matching

A link is an insert reference when **all** of the following hold:

- Standard markdown link syntax: `[label](path)`
- Target path contains `diagram`, `diagrams`, `table`, `tables`, `figure`, `figures`, `media`, `insert`, or `inserts`
- Target ends in `.md` (optional `#fragment` suffix is ignored for file lookup)
- Target is not `http://` or `https://`

#### Exclusions

The hook **does not** transform:

- Regular shard links (for example `./intro.md`, `../glossary/term.md`)
- Direct links to binary assets (for example `../figures/architecture.png`, `../figures/demo.mp4`) — use a captioned `.md` insert shard that embeds the media instead
- External URLs, even when the path contains `diagrams/`
- Links to missing insert files (left unchanged)
- Body text when `inlineInserts` is not in `compile.hooks`

#### First inline (GFM headings)

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

#### Numbered captions

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

#### Deduplication

Within one guide:

- First link to `../diagrams/flow.md` → inline under numbered heading
- Later links to the same resolved file (any path spelling, with or without `#fragment`) → `[label](#diagram-1-…)`
- Same basename in different libraries (`diagrams/overview.md` vs `tables/overview.md`) → separate headings and anchors

#### Path resolution

Lookup order for insert shard paths:

1. Relative to the current shard directory
2. Relative to the shard parent directory
3. `process.cwd()` and its parent
4. Optional `hooksConfig.inlineInserts.searchRoots`

#### Config

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

#### Compile output example

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

Details in the [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md).

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
