# Design architecture task prompt (mdcp)

Copy the block below into your agent. Fill in the code block at the top, then send.

---

**Replace before sending:**

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

**Role:** Act as an expert Systems Architect.

**Setup:** Follow WORK_ITEM_LOOKUP above. Inspect the repository for scope, acceptance criteria, validation commands, and delivery conventions before editing. Treat acceptance criteria as the scope boundary — one design or RFC at a time; do not expand into adjacent issues unless WORK_ITEM explicitly includes them.

**Plan:** Outline steps from WORK_ITEM and repo context. Pull only the shards, docs, and code paths needed for this task.

**Value focus:** Explicitly define the **end-user value** this architectural change unlocks (for example faster load times, higher reliability, or enabling a highly requested feature).

**Workflow:**

- **Branch first:** Create a feature branch for this WORK_ITEM from updated `main` before design shards or code. One branch per issue — do not mix unrelated designs.
- Make logically grouped commits per this repo's conventions.
- **Design first:** Draft the architecture (system diagrams, API contracts, data models) as shards under `docs/features/`. Focus on how the design enables the desired end-user experience.
- **Review:** Check the proposed architecture for bottlenecks and fit with the as-built system.
- **Refactor & clean:** Retire superseded design shards or ADRs. Document the intended as-built architecture only — not deprecated constraints.
- **Validate:** Run this repo's documentation validation commands until they pass (discover from developer docs or package scripts).
- **Wrap-up:** Record architectural changes per this repo's release and communication conventions. DO NOT detail any old behavior that no longer works in our docs. That belongs in our changeset.
- **Finalize:** Submit work for review and link WORK_ITEM.
