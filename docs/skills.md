# Skills Index

The MDCP documentation system is a human/machine interface tool. To make it easy for AI agents to adopt the discipline, the system is shipped as a suite of modular Agent Skills.

## Core System

| Skill                           | Description                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [mdcp](../skills/mdcp/SKILL.md) | Parent skill. Teaches the core docs-as-code discipline, what belongs where, and how to use the CLI tools. |

## Helper Commands

Specialized workflows that build on the parent skill. Use these to trigger specific types of work.

| Skill                                                                   | Description                                                                                                                                                                         |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [mdcp-getting-started](../skills/mdcp-getting-started/SKILL.md)         | Bootstrap MDCP in a new repository.                                                                                                                                                 |
| [mdcp-doc-only](../skills/mdcp-doc-only/SKILL.md)                       | Documentation-only work. Act as a Technical Writer.                                                                                                                                 |
| [mdcp-design-architecture](../skills/mdcp-design-architecture/SKILL.md) | Record architecture as MDCP shards (RFCs/ADRs); not deep design critique or product code. See [Design-architecture helper](./features/protocol/skills/mdcp-design-architecture.md). |
| [mdcp-feature-level](../skills/mdcp-feature-level/SKILL.md)             | Implement and document features (docs-first, then TDD). Act as a Software Engineer.                                                                                                 |
| [mdcp-ux](../skills/mdcp-ux/SKILL.md)                                   | User experience design and client-guide updates. Act as a UX Designer.                                                                                                              |

## Architecture Extensions

Optional archetype skills for specific documentation architectures (Work in Progress).

| Skill                                                                         | Description                           |
| ----------------------------------------------------------------------------- | ------------------------------------- |
| [mdcp-arch-oss-library](../skills/mdcp-arch-oss-library/SKILL.md)             | Open-source library archetype.        |
| [mdcp-arch-product-docs-site](../skills/mdcp-arch-product-docs-site/SKILL.md) | Product documentation site archetype. |
