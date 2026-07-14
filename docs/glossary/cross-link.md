# cross-link

A Markdown link whose target is another place in the docs set — usually a same-document `[label](#heading-slug)` fragment, or a path to another shard/guide that compile may rewrite.

Cross-links are why [refs](./refs.md) exist: after assemble, the visible heading text and level can change, so the [heading slug](./heading-slug.md) that works in a shard may differ from the slug in the compiled file. MDCP rewrites and validates these targets so published and monolith outputs keep working links. See [Built-in link validation](../features/link-validation.md).
