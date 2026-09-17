# Compile semantics

What an implementation does to turn an ordered set of shards into a rendered document.

## Output paths

Each guide compiles to one output file. Its path is `compile.outputFile` when set, otherwise a default name under `outputDir`: `{name}.md`, or `guide.md` when `compileOrder` holds exactly one guide.

A relative output path **MUST** be resolved under `outputDir`. When the path is instead docs-root-relative but still lands inside `outputDir`, an implementation **MUST** accept that reading. An absolute path **MUST** be used unchanged, which is how a guide publishes outside the docs root.

A guide whose `compile.outputFile` is set is **publish-only**: it **MUST** be excluded from the stitched monolith. Its rendered document is the publish target instead.

## Guide heading

When `compile.title` is set, an implementation **MUST** emit it as a level-two heading followed by a blank line, and **MUST** drop the first heading of the first shard when that heading's text equals the title, so the title is not stated twice.

When `compile.title` is absent, an implementation **MUST** emit the first level-one heading found in the manifest, if any.

## Per-shard assembly

For each shard in compile order, an implementation **MUST**:

1. Read the file, failing when it does not exist.
2. Trim surrounding whitespace.
3. Apply the preamble rule below when the filename matches `compile.preambleSection`, otherwise demote every heading by one level.
4. Apply the configured [compile hooks](./05-hooks.md) in order.
5. Rewrite links, as specified below.
6. Wrap the result in source tags unless they are disabled.

### Heading demotion

Demotion adds one to each heading level and **MUST** clamp at level six. An implementation **MUST NOT** demote inside fenced code blocks: a line opening a fence with three or more backticks or tildes toggles fence state, and a closing fence **MUST** match the opening fence character. Lines inside a fence are copied verbatim.

Demotion is what makes a shard's own level-one heading become a section heading of the guide.

### Preamble

The shard named by `compile.preambleSection` — `about-this-guide.md` by default — is treated as front matter. An implementation **MUST** drop its leading level-one heading when that heading's text matches the locale's about-this-guide title, compared case-insensitively after trimming, and **MUST** then demote the remaining body. When the body is empty after stripping, the shard contributes nothing.

The locale binding matters: the title compared against is supplied by the active locale pack, not hard-coded English.

### Source tags

Unless `sourceTags` is false for the guide or globally, an implementation **MUST** wrap each shard body as follows, where the path is the shard's path relative to the directory holding the rendered output:

```text
<!-- mdcp-shard: start {relativePath} -->

{body}

<!-- mdcp-shard: end {relativePath} -->
```

These markers are how a reader and a tool tell compiled output from source. They are the basis of the rule that compiled files are never hand-edited.

## Link rewriting

Links are rewritten so that a reader of the rendered document lands somewhere real. Three rewrites apply, in this order.

**Cross-guide links.** A link to a shard belonging to another guide **MUST** be rewritten to that guide's rendered output, with the target shard's slug as the fragment. A guide named in `crossGuideLinks.ignoreGuides` is exempt: links into it keep their source `.md` path.

**Intra-guide links.** A link to a shard in the same guide **MUST** be rewritten to a fragment-only link using that shard's section slug, because both shards land in the same rendered document.

**Publish-relative links.** When a guide publishes outside `outputDir`, remaining relative file links **MUST** be rebased so they resolve from the publish location rather than from the shard directory.

After assembly, an implementation **MUST** re-run intra-guide rewriting over the whole document, so links produced by hooks are rewritten too.

## Whole-document rules

After all shards are assembled, an implementation **MUST**:

- collapse runs of three or more newlines to exactly two;
- trim leading and trailing whitespace and end the document with exactly one newline;
- strip explicit anchor markers, unless `compile.stripAnchors` is false;
- annotate links that resolve to nothing, unless `compile.links.markBroken` is false.

Broken-link annotation marks the compiled output rather than failing the compile. Failing is the validator's job, specified in [Validation pipeline](./07-validation.md).

## The stitched monolith

When top-level `outputFile` is set, an implementation **MUST** additionally write a single document containing every guide that is not publish-only, in `compileOrder` order. The first such guide's text is used as-is; each subsequent guide's text **MUST** be demoted by one further level so that guides nest under the monolith's own structure.

The banner **MUST** be prepended to the monolith when `outputFile` is set, and to each per-guide output whose `includeBanner` is true.

## Backups

When `backup.enabled` is true, an implementation **MUST** copy an existing output to the backup directory before overwriting it. Backups are an adopter convenience and **MUST NOT** change compiled content.
