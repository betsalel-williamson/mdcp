# Glossary

Acronyms and terms used across the mdcp product docs.

When you introduce an acronym in a shard, spell out the term on first use and link the short form here — e.g. GitHub Flavored Markdown ([GFM](./glossary.md#gfm)).

## GFM

**GitHub Flavored Markdown** — the dialect mdcp accepts for shard source and compiled output: standard Markdown plus GitHub extensions (tables, task lists, strikethrough, autolinks, and fenced code). Not Pandoc, LaTeX, or wikilinks. See [GFM scope](./design-constraints.md#gfm-scope).

**Authored GFM** — shard markdown as written by humans or agents before compile: no preprocessor substitution, template conditionals, or macro expansion. Compile hooks transform authored GFM during assembly; they do not evaluate variables or branch on runtime context.
