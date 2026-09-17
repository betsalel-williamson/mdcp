# Configuration

The `mdcp.config.json` contract: which fields a conforming repository provides, and what an implementation does when they are absent.

## Loading

Configuration is a single JSON document. An implementation **MUST** resolve its path against the invocation directory, **MUST** fail when the file is absent, and **MUST** reject a document that does not satisfy the schema rather than compiling a partial tree. The reference schema is published at `packages/mdcp-core/mdcp.config.schema.json`; the authoritative shape is [`MdcpConfigSchema`](../../../../packages/mdcp-core/src/config/schema.ts).

Unknown top-level fields are not part of this specification. An implementation **MAY** reject them.

## Required fields

`compileOrder` is the only required field. It **MUST** be a non-empty array of guide names, and it **MUST** be treated as the document order of the guides in a stitched monolith.

Every other field has a normative default and **MAY** be omitted.

## Top-level fields

Protocol version expansion is specified in [Conformance and versioning](./00-conformance-and-versioning.md#protocol-version).

| Field              | Type         | Default                | Meaning                                                                     |
| ------------------ | ------------ | ---------------------- | --------------------------------------------------------------------------- |
| `protocolVersion`  | string       | `0.5.0.0`              | Four-part protocol version                                                  |
| `compileOrder`     | string array | —                      | Guide names in document order; **MUST** hold at least one entry             |
| `outputDir`        | string       | `_build`               | Generated output root, relative to the docs root                            |
| `outputFile`       | string       | absent                 | When set, a stitched monolith is written at this path                       |
| `banner`           | string       | auto-generated warning | Prepended to written outputs                                                |
| `sourceTags`       | boolean      | `true`                 | Wrap each shard in start and end markers naming its source                  |
| `guides`           | guide array  | absent                 | Per-guide overrides; a guide named in `compileOrder` **MAY** be absent here |
| `standaloneGuides` | string array | `[]`                   | Files registered as captured but never compiled                             |
| `source`           | string       | absent                 | Monolith input for `mdcp shard`                                             |

An implementation **MUST** write per-guide outputs whether or not `outputFile` is set. The monolith is additional, not an alternative.

## Guide fields

Each entry in `guides` **MUST** carry a `name` matching an entry in `compileOrder`. A name in `guides` that appears nowhere in `compileOrder` is inert: it configures nothing and **MUST NOT** cause a failure.

| Field        | Type   | Default             | Meaning                                              |
| ------------ | ------ | ------------------- | ---------------------------------------------------- |
| `name`       | string | —                   | Guide name; **MUST** be present                      |
| `path`       | string | `{docsRoot}/{name}` | Shard directory                                      |
| `splitLevel` | number | `2`                 | Heading level used when splitting a monolith; 1 to 6 |
| `source`     | object | absent              | Monolith extraction rules for `mdcp shard`           |
| `compile`    | object | absent              | Compile overrides, below                             |

## Compile overrides

The `hooks` and `hooksConfig` fields are specified in [Compile hooks](./05-hooks.md).

| Field                          | Type            | Default               | Meaning                                                 |
| ------------------------------ | --------------- | --------------------- | ------------------------------------------------------- |
| `manifest`                     | string          | `index.md`            | Manifest filename                                       |
| `preambleSection`              | string          | `about-this-guide.md` | Shard treated as preamble                               |
| `sectionsHeading`              | string          | absent                | Only links after this `##` heading define compile order |
| `title`                        | string          | absent                | Injected guide title                                    |
| `scopeRoot`                    | string          | absent                | Extra subtree admitted to transitive inclusion          |
| `outputFile`                   | string          | absent                | Publish path; excludes the guide from the monolith      |
| `includeBanner`                | boolean         | `true`                | Prepend the banner to this guide's output               |
| `sourceTags`                   | boolean         | inherits top level    | Per-guide source-tag control                            |
| `hooks`                        | array or object | built-in defaults     | Hook pipeline                                           |
| `hooksConfig`                  | object          | absent                | Per-hook options                                        |
| `stripAnchors`                 | boolean         | `true`                | Remove explicit anchor markers from compiled output     |
| `crossGuideLinks.ignoreGuides` | string array    | absent                | Guides whose shard links keep source `.md` paths        |
| `links.markBroken`             | boolean         | `true`                | Annotate unresolvable links in compiled output          |

## Refs, scan, backup, and peers

| Group    | Field           | Default             | Meaning                                                |
| -------- | --------------- | ------------------- | ------------------------------------------------------ |
| `refs`   | `registryFile`  | `.caches/refs.json` | Registry path relative to `outputDir`                  |
| `refs`   | `slugAlgorithm` | `github`            | **MUST** be `github` in 1.0; no other value is defined |
| `scan`   | `gitignore`     | `true`              | Honor `.gitignore` during the coverage scan            |
| `scan`   | `ignore`        | `[]`                | Extra ignore globs                                     |
| `scan`   | `root`          | invocation dir      | Walk root for the coverage scan                        |
| `scan`   | `strict`        | `false`             | Make coverage gaps fatal                               |
| `backup` | `enabled`       | `false`             | Back up outputs before overwrite                       |
| `backup` | `dir`           | `.caches/backups`   | Backup directory relative to `outputDir`               |
| `backup` | `ext`           | empty string        | Suffix appended to backup filenames                    |
| `lint`   | —               | absent              | Peer linter wiring; entirely optional                  |
| `vale`   | —               | absent              | Peer prose linter wiring; entirely optional            |

The coverage scan root defaults to the invocation directory rather than the docs root, because files that a guide captures — package READMEs, for example — commonly live outside the docs root.

`slugAlgorithm` is an enumeration with a single member so that a future algorithm can be added without changing the shape of the field. An implementation **MUST** reject any other value rather than silently falling back.
