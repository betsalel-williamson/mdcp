# Manifest

How a guide declares which shards it contains and in what order.

## Manifest file

Each guide **MUST** contain a manifest file in its guide directory. The filename comes from `compile.manifest` and defaults to `index.md`. Review trees conventionally use `shards.md`.

An implementation **MUST** fail when the manifest is absent. The reference implementation raises `No {manifest} in {guideDir}`.

## Compile order

Compile order is the order of Markdown file links in the manifest, read top to bottom.

An implementation **MUST** collect every link whose target ends in `.md`, in document order, and **MUST** strip any `#fragment` before resolving. A target **MUST** be resolved relative to the guide directory. A path that has already been collected **MUST NOT** be collected twice; the first occurrence fixes its position.

After file links, an implementation **MUST** also collect fragment-only links of the form `](#slug)` by treating `{slug}.md` as a candidate filename in the guide directory, and **MUST** include it only when that file exists. The slug `table-of-contents` **MUST** be skipped, because it names a generated section rather than a shard.

Ordering is therefore authored, not alphabetical and not filesystem order. Moving a link in the manifest moves the section in the compiled document.

## Scoping the manifest to a section list

A manifest often opens with policy prose that contains example links. Setting `compile.sectionsHeading` to a heading title makes an implementation discard everything before the first `## {title}` line, matched case-insensitively, and collect links only from that point on. When no such heading is found, the whole manifest text **MUST** be used.

## Directory fallback

When manifest scanning yields no links at all, an implementation **MUST** fall back to every `*.md` file directly in the guide directory, excluding the manifest itself and `shards.md`, sorted by filename.

The fallback exists so a new guide compiles before its manifest is written. A conforming repository **SHOULD NOT** rely on it: the ordering it produces is alphabetical, which is rarely the reading order an author wants.

## Transitive inclusion

Compile does not stop at the manifest. Starting from the manifest's sections, an implementation **MUST** follow Markdown file links inside each collected shard and collect further shards, repeating until no new file is found.

A transitively discovered file **MUST** be collected only when all of the following hold:

- it exists on disk;
- it has not already been collected;
- it resolves inside the guide directory subtree, or inside the `compile.scopeRoot` subtree when that option is set.

`scopeRoot` is what lets a shared tree such as `glossary/` be pulled into several guides without being a guide of its own. Note that `scopeRoot` widens transitive discovery only; it does not filter the links collected from the manifest itself.

Transitive inclusion means a shard reachable from a guide is part of that guide whether or not the manifest names it. Authors who want a file to stay out of compiled output **MUST NOT** link it from a collected shard.

## Interaction with the orphan check

The orphan check reads the manifest **without** transitive expansion, and inspects only the top level of the guide directory. A shard that sits in a subdirectory and is reached only transitively is compiled but is not orphan-checked. This asymmetry is a known gap rather than an intended rule; it is recorded in the gap list on [GitHub #48](https://github.com/betsalel-williamson/mdcp/issues/48).
