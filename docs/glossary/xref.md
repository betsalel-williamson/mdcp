# xref

An **xref** (in this repository) is a **Pandoc-style explicit identifier** written after a heading title — the brace-hash form `{#…}` (for example a heading line that ends with a custom id marker).

MDCP does **not** use xrefs as a first-class authoring feature. Fragment targets come from [heading slugs](./heading-slug.md) derived from [GFM](./gfm.md) heading text. Authors should **remove** Pandoc identifiers; this repo’s dogfood Vale style `MDCP-Xref` warns on them. Compile may strip leftover markers for cleanup — that is defensive, not an invitation to author them. See [Locale and language boundary](../features/design-constraints/locale-and-language.md).

Not the same as a [cross-link](./cross-link.md) (a GFM markdown link to a heading or shard). Not the same as en-US Vale prose cues when body text mentions a numbered heading without linking (`MDCP` style in `@bwilliamson/mdcp-presets`).
