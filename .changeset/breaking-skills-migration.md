---
'@bwilliamson/mdcp-cli': minor
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-presets': patch
---

**BREAKING CHANGE: Migration to Agent Skills & Removal of `spec/`**

We have replaced the legacy `mdcp.config.json` extension packs system and dynamic prompt fetching (`.caches/mdcp/prompts/`) with portable [Agent Skills](https://agentskills.io/). The built-in meta-prompts and workflows are now shipped as Agent Skills available locally at `.agents/skills/`.

As an evolving standard in alpha, this is a breaking change to how prompts and agent instructions are delivered. Old configurations relying on the `prompts-mdcp-defaults` extension pack will no longer dynamically fetch the prompts. The `spec/` folder has been entirely removed, and legacy HTTP `GET` requests to these paths and `llms-index` artifacts will now result in a `404 Not Found`.

**Migration Guide for Early Adopters:**

1. **Update Config**: Remove the `"extensions": { "packs": [...] }` block and the `"protocol": { "llmsIndex": { ... } }` block from your `mdcp.config.json`.
2. **Clean Cache & Legacy Files**: Delete the legacy `.caches/` directory from your documentation root (which contained downloaded prompts and artifacts), as well as any generated `mdcp.v*.llms.txt` bootstrap files.
3. **Handle Removed CLI Commands**: The `--fetch` and `--llms-index` CLI arguments are now deprecated and will throw an error indicating that Agent Skills should be used instead.
4. **Install New Skills**: Run `npx skills add betsalel-williamson/mdcp --skill mdcp` to install the new parent skill directly into your repository.
5. **Update Workflows**: Point your agents to the new source of truth in your `.agents/skills/` directory rather than the `.caches/mdcp/prompts/` directory or `mdcp.v*.llms.txt` file.

This new "vendoring" approach replaces the hidden cache directory with explicit, version-controlled files, making agent instructions reviewable in your pull requests alongside code changes.
