# Agent Skill (consumer)

Install the MDCP **parent Agent Skill** when you want a documentation system coding agents will follow — sharded docs, compile/check discipline — without a host-specific IDE extension.

This path is **host-agnostic**. It does not depend on Cursor, VS Code Marketplace, or any single product.

## Install

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

That vendors the skill into `.agents/skills/`. Zero-install alternative: copy `skills/mdcp/` from the upstream repository into your project's `.agents/skills/mdcp/`. Prefer `.agents/skills/` over host-specific aliases.

## Versioning and Upgrades

Agent Skills use a **vendoring** strategy. Instead of relying on a hidden `.caches/` directory and dynamic fetches pinned by `mdcp.config.json` (as the old extension packs did), skills become part of your project's source code:

1. The `npx skills add` command downloads the skill directly into your `.agents/skills/` directory.
2. You **commit** these files to your repository. This ensures that every developer and agent on your team operates with the exact same instructions, and any changes to the skill are reviewable in pull requests.
3. To **upgrade**, simply re-run the `npx skills add` command, review the `git diff`, and commit the changes.

## Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **Break it down:** Organize information into the smallest possible pieces (shards).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, or incident logs in the durable documentation.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

## How this relates to CLI scripts

Keep using npm scripts for compile and check — see [Agent integration](./agent-integration.md).

Plain-language: **compile** builds compiled docs from shards; **check** validates the documentation tree; **refs** is the cross-link fragment registry. The skill’s `scripts/` are thin wrappers into `@bwilliamson/mdcp-cli` — they do not replace the CLI.

## Next steps

1. Install the parent skill.
2. Add [Install and quick start](./install-and-quick-start.md) CLI wiring.
