# UX task prompt (mdcp)

Copy the block below into your coding agent. Replace placeholders per [work-item-tracking.md](./work-item-tracking.md).

---

**Role:** Act as an expert UX Designer and Frontend Engineer.

**Setup:** Create a feature branch from `{{BASE_BRANCH}}` (sync with remote first). Load work item **{{WORK_ITEM}}** using your team's tracker — shell CLI (`gh`, `glab`, `jira`), MCP (Linear, Notion, GitHub), or local `.work-items/{{FEATURE}}/` spec files. Treat acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this UI/UX change brings. Focus on reducing friction, improving accessibility, and creating a delightful user journey.

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Design & implement:** Map the ideal user flow in shards under `docs/client/` (docs/specs first). Implement UI components; use TDD for frontend components where applicable.
- **Review:** Meta-review code and user flows with design/product stakeholders.
- **Refactor & clean:** Consolidate UI patterns. Update client-guide shards to match the as-built interface; remove references to old UI patterns.
- **Validate:** Run component tests, then `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record visual and interactive changes in your release process (changeset, changelog, or tracker comment). Highlight old UI behaviors or workflows that no longer exist.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link **{{WORK_ITEM}}**, and request review.
