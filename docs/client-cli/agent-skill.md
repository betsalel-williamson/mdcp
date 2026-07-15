# Agent Skill (related)

This section is about the **MDCP Agent Skill**, not `@bwilliamson/mdcp-cli`. The skill is a separate install (`npx skills add`) and a separate product surface from this CLI package. Prefer the [root README](../../README.md) as the skill-first landing; this page is a cross-link for CLI consumers.

Install the **parent Agent Skill** when you want coding agents to follow docs-as-code discipline — sharded docs, compile/check habits — without a host-specific IDE extension. The skill still expects this CLI (or equivalent) for `mdcp compile` / `mdcp check`.

This path is **host-agnostic**. It does not depend on Cursor, VS Code Marketplace, or any single product.

## Install

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

That vendors the skill into `.agents/skills/`. Zero-install alternative: copy `skills/mdcp/` from the upstream repository into your project's `.agents/skills/mdcp/`. Prefer `.agents/skills/` over host-specific aliases.

## Versioning and Upgrades

Agent Skills use a **vendoring** strategy: skill files become part of your project's source code under `.agents/skills/`.

1. The `npx skills add` command copies the skill into your `.agents/skills/` directory.
2. You **commit** these files to your repository. Every developer and agent on your team then uses the same instructions, and skill changes are reviewable in pull requests.
3. To **upgrade**, re-run `npx skills add`, review the `git diff`, and commit the changes.

## Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **Break it down:** Organize information into the smallest possible pieces (shards).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, or incident logs in the durable documentation.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

## How this relates to the CLI

The skill does **not** ship the `mdcp` binary. Keep using this package (or [Agent integration](./agent-integration.md) scripts) for compile and check.

Plain-language: **compile** builds compiled docs from shards; **check** validates the documentation tree; **refs** is the cross-link fragment registry. The skill’s `scripts/` are thin wrappers into `@bwilliamson/mdcp-cli` — they do not replace the CLI.

## Next steps

1. Install the parent skill (`npx skills add … --skill mdcp`).
2. Run `/mdcp help me get started` and answer `FEATURE` / `PERSONA`.
3. Ensure [Install and quick start](./install-and-quick-start.md) CLI wiring exists so agents can run `mdcp compile` / `mdcp check`.
