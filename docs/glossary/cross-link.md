# cross-link

A Markdown link whose target is another place in the docs set — usually a same-document `[label](#heading-slug)` fragment, or a path to another shard/guide that compile may rewrite.

MDCP models **[GFM](./gfm.md) headings and links** only. It does not treat “chapter” or “section” as protocol concepts. Prefer ordinary GFM links for navigation; [heading slugs](./heading-slug.md) are computed from heading text (language-agnostic GitHub slug rules).

Cross-links are why [refs](./refs.md) exist: after assemble, the visible heading text and level can change, so the slug that works in a shard may differ from the slug in the compiled file. MDCP rewrites and validates these targets so published and monolith outputs keep working links. See [Built-in link validation](../features/link-validation.md).

Not a Pandoc [xref](./xref.md) (`{#…}` after a heading). Not a Vale prose cue for unlinked “See Chapter…” wording.
