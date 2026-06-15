---
'@bwilliamson/mdcp-cli': patch
---

Expand the published npm README with LLM collaboration prompt templates.

The compiled `packages/mdcp-cli/README.md` now includes spec-flow guidance (document before you code), work-item tracking placeholders (CLI, MCP, or local `.work-items/` specs), four task-type prompt templates (doc-only, design architecture, feature-level, UX), and phase-specific structured prompts. Standalone copy-paste files live under `examples/prompts/`.

**What changed:** new sections in `docs/client-cli/llm-collaboration.md`; six prompt files under `examples/prompts/` including `work-item-tracking.md` and `README.md`.

**Old behavior that no longer applies:** the LLM collaboration guide previously stopped at bootstrap and three follow-up prompts. Task-type workflows and spec-flow phases were not documented in the npm README or examples directory.
