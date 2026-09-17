# Refs registry

The generated heading registry: how slugs are assigned, what the registry holds, and when it is stale.

## Purpose

The registry is a machine-readable index of every heading in compiled output. It exists so that validation can answer "does this fragment resolve?" without re-parsing every document, and so that a stale registry is a detectable CI failure rather than a silent drift.

The registry is generated. It **MUST NOT** be hand-edited, and it **MUST** be reproducible from compiled output alone.

## Input

The registry is built from **compiled** text, not from shards. When top-level `outputFile` is set, the input is the stitched monolith; otherwise it is the per-guide outputs joined in `compileOrder` order.

## Slug assignment

Slugs **MUST** be assigned with the GitHub heading-slug algorithm, applied to the heading's plain visible text. Before slugging, an implementation **MUST** strip explicit anchor markers and bold markers from the heading title and trim the result. A heading whose title is empty after stripping **MUST** be skipped.

Slugs **MUST** be assigned sequentially across the document, so that a repeated heading title receives the disambiguating suffix that a Markdown renderer would give it. This makes slug assignment order-dependent by design: two documents with the same headings in a different order produce different slugs for the duplicates.

## Guide attribution

Each level-one heading **MUST** set the current guide key: the heading's slug, truncated to 32 characters, or `guide` when that is empty. Every heading after it is attributed to that guide until the next level-one heading.

## Semantic keys

Each heading **MAY** carry a semantic key. An implementation **MUST** ask the active locale pack for a key derived from the title, and **MUST** fall back to `{guide}.{slug truncated to 48 characters}` when the locale pack supplies none. A heading with no derivable key is recorded without one.

The fallback is Unicode-safe and language-agnostic, so that a non-English corpus still produces stable keys.

## Registry shape

The registry is a JSON document with three members:

| Member          | Type   | Holds                                            |
| --------------- | ------ | ------------------------------------------------ |
| `generatedFrom` | string | Always `compiled` in 1.0                         |
| `headings`      | array  | One entry per heading, in document order         |
| `slugs`         | object | Slug to semantic key, for headings that have one |

Each heading entry carries `key`, `slug`, `title`, `guide`, `sourceFile`, `level`, and `line`. `sourceFile` is populated when the compile run supplied a slug-to-source map, and is otherwise null. `line` is one-based within the compiled input.

An implementation **MUST** serialize the registry as JSON with two-space indentation and a trailing newline.

## Staleness

A registry is stale when its file content differs, byte for byte, from a freshly built registry serialized the same way. An implementation **MUST** treat a missing registry file and a differing registry file as distinct diagnostics, because the remedies differ only in whether a first generation ever ran.

Byte comparison rather than semantic comparison is deliberate: it makes the check cheap, and it makes the registry's own formatting part of the contract.
