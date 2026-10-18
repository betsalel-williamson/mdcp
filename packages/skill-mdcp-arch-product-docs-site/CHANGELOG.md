# @bwilliamson/skill-mdcp-arch-product-docs-site

## 0.7.3

### Patch Changes

- 9bc05cd: Use "compiled guide" for the file compile writes for one guide, and keep "monolith" for the optional top-level `outputFile`. The `mdcp compile` help text now reads "Stitch shards into compiled guides". The `ignoreGuides` type docs now say that links to a listed guide's shards keep source `.md` paths instead of `#slug` targets in the file that holds the target guide. The `standaloneGuides` schema description now says a standalone guide doesn't get compile output of its own. The `mdcp shard` help text now reads "Split a source document into shards (md-tree)". The `mdcp` skill's context guardrails tell agents not to load whole compiled output (a compiled guide or the monolith). The product docs site archetype skill now says "one large file" instead of "monolith" for an oversized authoring tree.

## 0.7.2

### Patch Changes

- d60f90d: Move skill version carriers and CHANGELOGs to packages/skill-* so npx skills add installs stay free of release metadata; publish skill notes on GitHub Releases in the same single-step main release job as npm packages.

## 0.7.1

### Patch Changes

- e017c43: Version packages and Agent Skills independently via Changesets; release on merge to main through the Version Packages PR. Major bumps stay blocked until maintainers open 1.0.
