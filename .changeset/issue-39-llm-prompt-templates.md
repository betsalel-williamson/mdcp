---
'@bwilliamson/mdcp-cli': patch
---

Expand the published npm README with LLM collaboration prompt templates.

The compiled `packages/mdcp-cli/README.md` now includes docs-first feature workflow guidance (tracker scope, feature and client shards, TDD), inline `WORK_ITEM` / `WORK_ITEM_LOOKUP` placeholders, four task-type prompt templates (doc-only, design architecture, feature-level, UX), and the renamed bootstrap prompt. Standalone copy-paste files live under `examples/prompts/`.

**What changed:** new sections in `docs/client-cli/llm-collaboration.md`; prompt library under `examples/prompts/` with `getting-started-with-mdcp.prompt.md` and `spec-driven-docs.mdc` agent rule.

**Old behavior that no longer applies:** the LLM collaboration guide previously stopped at bootstrap and three follow-up prompts. Task-type workflows, spec-flow phase prompts, and local `.work-items/` specs are no longer documented.
