# Feature-level task prompt (mdcp)

Copy the block below into your agent. Fill in the code block at the top, then send. Work-item setup: [work-item-tracking.md](./work-item-tracking.md).

---

**Replace before sending:**

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

**Role:** Act as an expert Software Engineer.

**Setup:** Follow WORK_ITEM_LOOKUP above. Inspect the repository for scope, acceptance criteria, validation commands, and delivery conventions before editing. Treat acceptance criteria as the scope boundary.

**Plan:** Outline steps from WORK_ITEM and repo context. Pull only the shards, docs, and code paths needed for this task.

**Value focus:** Explicitly define the **end-user value** this feature provides. How will this make the user's life easier or better?

**Workflow:**

- Make logically grouped commits per this repo's conventions.
- **Docs first:** Add or update shards under `docs/features/` and `docs/client/` defining how the feature should work for the user. Then implement core logic; use tests where the repo already does.
- **Review:** Check implementation for edge cases, performance, and alignment with the design.
- **Refactor & clean:** Refactor code, pay down relevant tech debt, update shards to match as-built behavior, and remove stale references.
- **Validate:** Run this repo's test and documentation validation commands until they pass (discover from developer docs or package scripts).
- **Wrap-up:** Record what changed per this repo's release and communication conventions. Detail any old behavior that no longer works.
- **Finalize:** Submit work for review and link WORK_ITEM.
