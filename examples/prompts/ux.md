# UX task prompt (mdcp)

Copy the block below into your agent. Fill in the code block at the top, then send.

---

**Replace before sending:**

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

**Role:** Act as an expert UX Designer and Frontend Engineer.

**Setup:** Follow WORK_ITEM_LOOKUP above. Inspect the repository for scope, acceptance criteria, validation commands, and delivery conventions before editing. Treat acceptance criteria as the scope boundary — one UX scope at a time; do not expand into adjacent issues unless WORK_ITEM explicitly includes them.

**Plan:** Outline steps from WORK_ITEM and repo context. Pull only the shards, docs, and code paths needed for this task.

**Value focus:** Explicitly define the **end-user value** this UI/UX change brings. Focus on reducing friction, improving accessibility, and creating a delightful user journey.

**Workflow:**

- **Branch first:** Create a feature branch for this WORK_ITEM from updated `main` before client shards, UI code, or tests. One branch per issue — do not mix unrelated UX work.
- Make logically grouped commits per this repo's conventions.
- **Design & implement:** Map the ideal user flow in shards under `docs/client/` (docs/specs first). Implement UI using this repo's existing patterns and test approach.
- **Review:** Check code and user flows against acceptance criteria and the as-built interface.
- **Refactor & clean:** Consolidate UI patterns. Update client-guide shards to match the as-built interface; remove references to superseded UI patterns.
- **Validate:** Run this repo's test and documentation validation commands until they pass (discover from developer docs or package scripts).
- **Wrap-up:** Record visual and interactive changes per this repo's release and communication conventions. DO NOT detail any old behavior that no longer works in our docs. That belongs in our changeset.
- **Finalize:** Submit work for review and link WORK_ITEM.
