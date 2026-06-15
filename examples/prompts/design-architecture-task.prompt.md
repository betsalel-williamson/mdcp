# Design architecture task prompt (mdcp)

Copy the block below into your coding agent. Fill in the code block at the top, then send. Tracker examples: [work-item-tracking.md](./work-item-tracking.md).

---

**Replace before sending:**

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

**Role:** Act as an expert Systems Architect.

**Setup:** Follow WORK_ITEM_LOOKUP above. Treat loaded acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this architectural change unlocks (for example faster load times, higher reliability, or enabling a highly requested feature).

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Design first:** Draft the architecture (system diagrams, API contracts, data models) as shards under `docs/features/`. Focus on how the design enables the desired end-user experience.
- **Review:** Meta-review the proposed architecture with engineering to identify bottlenecks early.
- **Refactor & clean:** Retire superseded design shards or ADRs. Ensure docs reflect the intended as-built architecture.
- **Validate:** Run `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record architectural changes in your release process (changeset, changelog, or tracker note). Document old system behaviors or constraints that no longer apply.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link WORK_ITEM above, and request review.
