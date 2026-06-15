# Feature-level task prompt (mdcp)

Copy the block below into your coding agent. Fill in the two lines at the top, then send. Tracker examples: [work-item-tracking.md](./work-item-tracking.md).

---

**Replace before sending:**

- {{WORK_ITEM}} — e.g. `39` or `https://github.com/org/repo/issues/39`
- {{WORK_ITEM_LOOKUP}} — e.g. `Branch from main (pull first). Run gh issue view 39 --comments.` · Linear MCP · read `.work-items/my-feature/` spec files

**Role:** Act as an expert Software Engineer.

**Setup:** Follow the lookup line above. Treat loaded acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this feature provides. How will this make the user's life easier or better?

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Docs first & TDD:** Start with a docs-first pass — shards under `docs/features/` and `docs/client/` defining how the feature _should_ work for the user. Then use TDD to implement the core logic.
- **Review:** Meta-code review focusing on edge cases and performance.
- **Refactor & clean:** Refactor code, pay down relevant tech debt, update shards to match as-built behavior, and remove stale references.
- **Validate:** Run tests, then `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record what changed in your release process (changeset, changelog, or tracker comment). Detail any old behavior that no longer works.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link the work item above, and request review.
