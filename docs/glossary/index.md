# Glossary

Acronyms and terms shared across mdcp product, developer, and consumer docs — like insert libraries (`diagrams/`, `tables/`), this tree is a **cross-guide artifact** under `docs/`, not owned by a single guide directory.

When you introduce an acronym in any shard, spell out the term on first use and link the short form here — e.g. GitHub Flavored Markdown ([GFM](../glossary/index.md#gfm)).

## GFM

**GitHub Flavored Markdown** — the dialect mdcp accepts for shard source and compiled output: standard Markdown plus GitHub extensions (tables, task lists, strikethrough, autolinks, and fenced code). Not Pandoc, LaTeX, or wikilinks. See [GFM scope](../features/design-constraints.md#gfm-scope).

**Authored GFM** — shard markdown as written by humans or agents before compile: no preprocessor substitution, template conditionals, or macro expansion. Compile hooks transform authored GFM during assembly; they do not evaluate variables or branch on runtime context.
