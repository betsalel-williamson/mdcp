# Glossary

Shared acronyms and terms for all mdcp docs. Spell out on first use in a shard and link the short form here.

## MDCP

**MarkDown Context Protocol** — a protocol for repository documentation context: sharded intent and design in Markdown, validated compile output for agents, CI, and human readers. The CLI is one surface; `compile`, `check`, `refs lookup`, and `export --llm` implement the shared context layer.

## GFM

**GitHub Flavored Markdown** — standard Markdown plus GitHub extensions (tables, task lists, fenced code). Not Pandoc, LaTeX, or wikilinks.

## Authored GFM

Shard markdown as written before compile — no preprocessor substitution or template conditionals. Compile hooks may transform it during assembly; see [Preprocessor / templating (out of scope)](../features/design-constraints/preprocessor-templating.md#preprocessor-templating-out-of-scope).
