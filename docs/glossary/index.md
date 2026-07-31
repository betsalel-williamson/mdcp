# Glossary

Shared acronyms and terms for all mdcp docs. Spell out on first use in a shard and link the short form here.

**Inclusion bar (this repository):** Add entries for MDCP-specific jargon, acronyms, and overloaded words that a new contributor or the stated client persona would not reliably understand from everyday English or general software practice alone (for example protocol terms, compile/refs vocabulary, and skill-verification names). Do **not** add entries for common English, universal programming terms, or words that are unambiguous in context for that audience. When unsure, prefer a short glossary entry over leaving shorthand unexplained. See [domain glossary](./domain-glossary.md).

Each term is its own shard under `docs/glossary/`. For large glossaries, split manifests across sub-index files (for example `index-protocol.md`, `index-format.md`) and set `compile.scopeRoot` to `glossary` so transitive links pull term shards into other guides.

## Protocol terms

- [Agent Skills](./agent-skills.md)
- [Skill](./skill.md)
- [MDCP](./mdcp.md)

## Skill verification

- [Atomic commit groups](./atomic-commit-groups.md)
- [live skill eval](./live-skill-eval.md)

## Documentation structure

- [shard](./shard.md)
- [idea mitosis](./idea-mitosis.md)
- [shard single responsibility](./shard-single-responsibility.md)

## Format and compile terms

- [check](./check.md)
- [GFM](./gfm.md)
- [Authored GFM](./authored-gfm.md)
- [locale pack](./locale-pack.md)
- [ignoreGuides](./ignore-guides.md)
- [refs](./refs.md)
- [refs registry](./refs-registry.md)
- [heading slug](./heading-slug.md)
- [cross-link](./cross-link.md)
- [standalone guide](./standalone-guide.md)
- [coverage](./coverage.md)
- [ReDoS](./redos.md)

## Adoption and messaging

- [WIIFM](./wiifm.md)
