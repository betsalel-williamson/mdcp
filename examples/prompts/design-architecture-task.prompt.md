# Design architecture task prompt (mdcp)

Copy the block below into your agent. Fill in the code block at the top, then send. Work-item setup: [work-item-tracking.md](./work-item-tracking.md).

---

**Replace before sending:**

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

**Role:** Act as an expert Systems Architect.

**Setup:** Follow WORK_ITEM_LOOKUP above. Inspect the repository for scope, acceptance criteria, validation commands, and delivery conventions before editing. Treat acceptance criteria as the scope boundary.

**Plan:** Outline steps from WORK_ITEM and repo context. Pull only the shards, docs, and code paths needed for this task.

**Value focus:** Explicitly define the **end-user value** this architectural change unlocks (for example faster load times, higher reliability, or enabling a highly requested feature).

**Workflow:**

- Make logically grouped commits per this repo's conventions.
- **Design first:** Draft the architecture (system diagrams, API contracts, data models) as shards under `docs/features/`. Focus on how the design enables the desired end-user experience.
- **Review:** Check the proposed architecture for bottlenecks and fit with the as-built system.
- **Refactor & clean:** Retire superseded design shards or ADRs. Ensure docs reflect the intended as-built architecture.
- **Validate:** Run this repo's documentation validation commands until they pass (discover from developer docs or package scripts).
- **Wrap-up:** Record architectural changes per this repo's release and communication conventions. Document old behaviors or constraints that no longer apply.
- **Finalize:** Submit work for review and link WORK_ITEM.
