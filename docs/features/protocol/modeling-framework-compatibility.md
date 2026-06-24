# Modeling framework compatibility

How established documentation and modeling systems relate to MDCP shards and `format-*` extension packs. Parent: [Extensions and archetypes](./extensions-and-archetypes.md).

## Principles

| Layer                          | Composable across domains | Exclusive per shard           |
| ------------------------------ | ------------------------- | ----------------------------- |
| Glossary shards                | Yes                       | —                             |
| Task prompts (`prompts-*`)     | Yes                       | —                             |
| ADR / RFC narrative shards     | Yes                       | —                             |
| C4 viewpoint diagram shard     | —                         | One viewpoint per shard       |
| ArchiMate layer diagram shard  | —                         | One notation per shard        |
| Function-point worksheet shard | —                         | One count worksheet per shard |

**Bridge pattern:** When mapping between systems (e.g. C4 container → ArchiMate application component), use a dedicated shard under `docs/extensions/` — do not mix notations in the same diagram shard.

## Framework matrix

| Framework                         | When to use                                                          | Mixes with                      | Do not mix with (same shard)                         |
| --------------------------------- | -------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------- |
| **C4 model**                      | Software system structure at context/container/component/code levels | Glossary, ADRs, pointer shards  | ArchiMate notation in the same diagram shard         |
| **ArchiMate**                     | Enterprise architecture layers and relationships                     | Glossary, strategy shards       | C4 boxes in the same diagram shard                   |
| **Function points (IFPUG-style)** | Scope and size estimation worksheets                                 | Glossary, feature intent shards | C4 or ArchiMate diagrams in the same worksheet shard |
| **UML (as GFM)**                  | Informal sequence or class sketches in Markdown                      | Glossary, design shards         | Competing formal notation in the same shard          |
| **ADR / RFC**                     | Decision records and change proposals                                | Any archetype                   | —                                                    |

## Extension packs (0.5)

| Pack id                  | Type                          | Status        |
| ------------------------ | ----------------------------- | ------------- |
| `format-c4`              | C4 viewpoint templates        | Draft 0.5.0.0 |
| `format-archimate`       | ArchiMate viewpoint templates | Draft 0.5.0.0 |
| `format-function-points` | Count worksheet templates     | Draft 0.5.0.0 |

Enable packs in `mdcp.config.json` under `extensions.packs`. Packs are optional — `mdcp check` must pass when they are disabled.

## Declaring notation in a shard

At the top of a diagram or worksheet shard, declare the primary framework:

```markdown
<!-- mdcp-format: c4-container -->
```

For exclusive packs, agents **MUST NOT** add a second notation without a separate bridge shard.
