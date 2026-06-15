# Feature-level task prompt (mdcp)

Copy the block below into your coding agent. Replace placeholders per [work-item-tracking.md](./work-item-tracking.md).

---

**Role:** Act as an expert Software Engineer.

**Setup:** Create a feature branch from `{{BASE_BRANCH}}` (sync with remote first). Load work item **{{WORK_ITEM}}** using your team's tracker — shell CLI (`gh`, `glab`, `jira`), MCP (Linear, Notion, GitHub), or local `.work-items/{{FEATURE}}/` spec files. Treat acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this feature provides. How will this make the user's life easier or better?

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Docs first & TDD:** Start with a docs-first pass — shards under `docs/features/` and `docs/client/` defining how the feature _should_ work for the user. Then use TDD to implement the core logic.
- **Review:** Meta-code review focusing on edge cases and performance.
- **Refactor & clean:** Refactor code, pay down relevant tech debt, update shards to match as-built behavior, and remove stale references.
- **Validate:** Run tests, then `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record what changed in your release process (changeset, changelog, or tracker comment). Detail any old behavior that no longer works.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link **{{WORK_ITEM}}**, and request review.
