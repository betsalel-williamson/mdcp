# Worked example

The `examples/sample-guides/` tree in this repository, read clause by clause. Every observation below is taken from its committed output.

## The tree

```text
examples/sample-guides/
  mdcp.config.json
  overview/
    index.md
    about-this-guide.md
    introduction.md
    coverage-and-where-to-look-coverage-and-where-to-look.md
  admin-guide/
    index.md
    chapter-1-getting-started.md
  developer-guide/
    index.md
    chapter-1-overview.md
  _build/
    overview.md  admin-guide.md  developer-guide.md  guides.md
```

## Configuration

The configuration names three guides in `compileOrder` and sets `outputFile` to `guides.md`. Per [Configuration](./03-configuration.md), that produces four documents: one per guide under `_build/`, plus the stitched monolith. `outputDir` is not set, so it defaults to `_build`.

A fourth guide, `inserts-demo`, appears in `guides` but not in `compileOrder`. It is inert, exactly as the inert-entry clause allows, and it exists to configure a hook pipeline for a directory used by other tests.

## Manifest resolution

`overview/index.md` reads:

```markdown
# Documentation Overview

- [Documentation Overview](#table-of-contents)
  - [About this guide](./about-this-guide.md)
  - [Introduction](./introduction.md)
  - [Coverage and where to look](./coverage-and-where-to-look-coverage-and-where-to-look.md)
```

Three clauses of [Manifest](./02-manifest.md) are visible at once. The `#table-of-contents` fragment link is skipped rather than resolved to a shard. The three file links fix compile order — `about-this-guide` first because it is listed first, not because of its name. And the level-one heading supplies the guide heading, because no `compile.title` is set.

## Preamble and demotion

`about-this-guide.md` contributes no heading to the output. Its level-one heading matched the locale's about-this-guide title and was dropped; the body that follows was demoted and emitted directly under the guide heading.

`introduction.md` carries `# Introduction` in source and appears as `## Introduction` in output — one level of demotion, as [Compile semantics](./04-compile.md) requires.

## Source tags

Each shard is wrapped in markers whose path is relative to the rendered document's directory:

```text
<!-- mdcp-shard: start ../overview/about-this-guide.md -->
```

The output lives at `_build/overview.md`, so the shard one directory up is `../overview/…`. A reader who finds this marker in compiled output knows exactly which file to edit instead.

## Link rewriting

`introduction.md` links to a shard in another guide. In compiled output the link is a bare fragment:

```markdown
See [Admin Guide Chapter 1](#admin-chapter-1-getting-started) for operational tasks.
```

The fragment is the slug of `# Admin Chapter 1 — Getting started`, assigned by the GitHub algorithm described in [Refs registry](./06-refs-registry.md). It is a fragment rather than a path because this configuration sets a top-level `outputFile`: both guides land in `guides.md`, so a reader following the link stays in the same document.

## Monolith nesting

The monolith's headings show the extra demotion that [Compile semantics](./04-compile.md) requires of every guide after the first:

```text
# Documentation Overview
## Introduction
## Coverage and where to look
## Admin Guide
### Admin Chapter 1 — Getting started
## Developer Guide
### Dev Chapter 1 — Overview
```

`Documentation Overview` keeps its level, because it is the first guide. `Admin Guide` was a level-one heading in its own output and appears here at level two, carrying its sections down with it.

## Validation

The sample configuration sets `scan.strict` to true and lists ignore globs for the asset directories — `diagrams/`, `figures/`, `media/`, `tables/`, `inserts/`, `inserts-demo/`. Under [Validation pipeline](./07-validation.md) that makes coverage gaps fatal for this tree, which is why every Markdown file in it is either compiled, ignored, or registered.

Built-in link validation is disabled here through `lint.links.enabled`, and each guide sets `links.markBroken` to false, so the sample stays readable as a teaching example rather than carrying broken-link annotations.

Running `mdcp check --config examples/sample-guides/mdcp.config.json --docs-root examples/sample-guides --require-lint --require-vale` exercises the whole pipeline against this tree.
