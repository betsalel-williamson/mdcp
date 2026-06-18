# Feature-level task prompt (mdcp)

Copy the block below into your agent. Fill in the code block at the top, then send.

---

**Replace before sending:**

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

**Role:** Act as an expert Software Engineer.

**Setup:** Follow WORK_ITEM_LOOKUP above. Read `mdcp.v1.llms.txt` in the docs root when present — it is the agent index for query commands and prompt locations. Inspect the repository for scope, acceptance criteria, validation commands, and delivery conventions before editing. Treat acceptance criteria as the scope boundary — one feature or design at a time; do not expand into adjacent issues unless WORK_ITEM explicitly includes them.

**Plan:** Outline steps from WORK_ITEM and repo context. Pull only the shards, docs, and code paths needed for this task.

**Value focus:** Explicitly define the **end-user value** this feature provides. How will this make the user's life easier or better?

**Workflow:**

- **Branch first:** Create a feature branch for this WORK_ITEM from updated `main` before docs, tests, or code. One branch per issue — do not mix unrelated features or designs.
- Make logically grouped commits per this repo's conventions.
- **Docs first:** Add or update shards under `docs/features/` (capabilities, design, API surface, acceptance criteria) and `docs/client/` (end-user value and how to use the feature). Update each guide's `index.md`. Use `mdcp refs lookup` for cross-links.
- **TDD:** Implement against the documented contract — write failing tests first where the repo already uses tests, then make them pass, then refactor.
- **Review:** Check implementation for edge cases, performance, and alignment with the design.
- **Refactor & clean:** Refactor code, pay down relevant tech debt, update shards to match as-built behavior, and remove stale references.
- **Validate:** Run this repo's test and documentation validation commands until they pass (discover from developer docs or package scripts).
- **Wrap-up:** Record what changed per this repo's release and communication conventions. DO NOT detail any old behavior that no longer works in our docs. That belongs in our changeset.
- **Finalize:** Submit work for review and link WORK_ITEM.
