# Agent Skill (consumer)

Install the MDCP **parent Agent Skill** so coding agents follow sharded-docs workflows without a host-specific IDE extension. Complementary skills (prompts, archetypes, format packs) install beside the parent as they migrate from the old extension packs.

This path is **host-agnostic**. It does not depend on Cursor, VS Code Marketplace, or any single product.

## Install

```bash
# Parent skill (primary agent entrypoint)
npx skills add betsalel-williamson/mdcp --skill mdcp

# Complementary skills (optional; as each pack migrates)
npx skills add betsalel-williamson/mdcp --skill mdcp-prompts-defaults
npx skills add betsalel-williamson/mdcp --skill mdcp-format-marp
```

Zero-install alternative: copy `.agents/skills/mdcp/` from this repository into your project (plus complementary skill folders when you need them). Prefer `.agents/skills/` over host-specific aliases.

## How this relates to CLI scripts

Keep using npm scripts for compile and check — see [Agent integration](./agent-integration.md). The skill teaches agents **when** to run those commands and **how** to load the smallest useful shard context. It does not replace `@bwilliamson/mdcp-cli`.

## Migration from llms-index bootstrap

Older onboarding copied or fetched `mdcp.v*.llms.txt` into the docs root. That file remains available during transition, but new projects should install the **parent skill** first. See [Agent Skill delivery](../features/agent-skill.md) for phases and backlog.

## Next steps

1. Install the parent skill (and complementary skills you need).
2. Add [Install and quick start](./install-and-quick-start.md) CLI wiring.
3. Use [LLM collaboration](./llm-collaboration.md) task prompts until `mdcp-prompts-defaults` ships as a skill.
