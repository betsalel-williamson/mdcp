# Glossary

Shared acronyms and terms for all mdcp docs. Spell out on first use in a shard and link the short form here.

## MDCP

**MarkDown Context Protocol** — a protocol for repository documentation context: sharded intent and design in Markdown, validated compile output for agents, CI, and human readers. The CLI is one surface; `compile`, `check`, `refs lookup`, and `export --llm` implement the shared context layer.

## GFM

**GitHub Flavored Markdown** — standard Markdown plus GitHub extensions (tables, task lists, fenced code). Not Pandoc, LaTeX, or wikilinks.

## Authored GFM

Shard markdown as written before compile — no preprocessor substitution or template conditionals. Compile hooks may transform it during assembly; see [Preprocessor / templating (out of scope)](../features/design-constraints/preprocessor-templating.md#preprocessor-templating-out-of-scope).

## ignoreGuides

Guide names listed on the **compiling** guide under `compile.crossGuideLinks.ignoreGuides`. Cross-guide links to those guides keep source shard `.md` paths instead of rewriting to monolith `#slug` targets. Does not exclude the guide from `compileOrder` or the link index — only skips link rewrite for those targets. On publish outputs, [publish-relative rewrite](../client-core/compile-hooks/publish-relative-links.md) still rebases the shard path for the publish file. See [Cross-guide link rewriting](../client-core/compile-hooks/cross-guide-links.md).
