---
'@bwilliamson/mdcp-cli': minor
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-presets': patch
---

**BREAKING CHANGE: Migration to Agent Skills**

We have replaced the legacy `mdcp.config.json` extension packs system and dynamic prompt fetching (`.caches/mdcp/prompts/`) with portable [Agent Skills](https://agentskills.io/). The built-in meta-prompts and workflows are now shipped as Agent Skills available locally at `.agents/skills/`.

As an evolving standard in alpha, this is a breaking change to how prompts and agent instructions are delivered. Old configurations relying on the `prompts-mdcp-defaults` extension pack will no longer dynamically fetch the prompts.

**Migration Guide for Early Adopters:**

1. **Update Config**: Remove the `"extensions": { "packs": [...] }` block from your `mdcp.config.json` (or set it to `[]`).
2. **Clean Cache**: Delete the legacy `.caches/mdcp/prompts/` directory from your documentation root.
3. **Install New Skills**: Run `npx skills add betsalel-williamson/mdcp --skill mdcp` to install the new parent skill directly into your repository.
4. **Update Workflows**: Point your agents to the new source of truth in your `.agents/skills/` directory rather than the `.caches/mdcp/prompts/` directory.

This new "vendoring" approach replaces the hidden cache directory with explicit, version-controlled files, making agent instructions reviewable in your pull requests alongside code changes.
