# MDCP 101

A five-minute mental model for first-time adopters. Edit **shards** (small Markdown files), compile them into publish outputs, and validate with `mdcp check` — never hand-edit generated READMEs. For the full model, see [Overview](../features/overview.md).

## Sharded structure

Language-agnostic shards sit in audience tiers. Compile stitches them into the outputs readers and agents consume.

```mermaid
flowchart TB
  subgraph tiers["Guide tiers (Code Repository Archetype)"]
    features["features/ — capabilities and contracts"]
    client["client/ — end-user value and usage"]
    developer["developer/ — contributor workflows"]
    glossary["glossary/ — shared terms"]
  end

  subgraph toolchain["MDCP toolchain"]
    config["mdcp.config.json"]
    cli["mdcp compile / check"]
  end

  subgraph outputs["Publish outputs"]
    readme["README.md"]
    developers["DEVELOPERS.md"]
    pkg["package READMEs"]
  end

  features --> cli
  client --> cli
  developer --> cli
  glossary --> cli
  config --> cli
  cli --> readme
  cli --> developers
  cli --> pkg
```

## Init workflow

Bootstrap the Agent Skill, then let `/mdcp` wire the docs tree before your first feature.

```mermaid
flowchart LR
  install["npx skills add … --skill mdcp"] --> bootstrap["/mdcp help me get started"]
  bootstrap --> layout["Config + guide layout"]
  layout --> first["Optional first feature"]
  first --> check["mdcp check"]
```

## Extensions layer

Keep the portable skill generic. Put project-specific guidance in repo shards or extensions — do not hand-edit vendored skill files.

```mermaid
flowchart TB
  subgraph core["Protocol core"]
    skill["Agent Skill mdcp"]
    packages["CLI + core packages"]
  end

  subgraph repo["Your repository"]
    shards["features / client / developer / glossary"]
    ext["docs/extensions/ or complementary skills"]
  end

  skill --> shards
  packages --> shards
  shards --> ext
```

## Problems and solutions

```mermaid
flowchart LR
  subgraph problems["Common pain"]
    mono["Monolith README"]
    dump["mdcp.v*.llms.txt dump"]
    chat["Intent only in chat"]
  end

  subgraph solutions["MDCP response"]
    shards2["Small validated shards"]
    agentskill["Agent Skill workflows"]
    gate["mdcp check in CI"]
  end

  mono --> shards2
  dump --> agentskill
  chat --> gate
```
