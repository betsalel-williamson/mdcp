# Work item tracking (prompt setup)

Task-type prompts use a **Replace before sending** code block at the top — fill in the values, then send the rest unchanged.

## Replace block

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

- **`WORK_ITEM`** — identifier for the task (ticket, URL, or local spec slug)
- **`WORK_ITEM_LOOKUP`** — where the agent finds scope and delivery conventions (see below)

The prompt body refers to `WORK_ITEM` and `WORK_ITEM_LOOKUP` by name. Everything below the code block is static.

## What goes in `WORK_ITEM_LOOKUP`

Do not hard-code a tracker, CLI, or integration in the prompt. Each repo documents its stack once in **developer docs**. The lookup line sends the agent there; the agent discovers commands and tools from that context.

Pattern:

```text
WORK_ITEM_LOOKUP=Load WORK_ITEM per this repo's developer docs (work-item tracking section). If those docs are silent, inspect the repository for tracker links, local .work-items/ specs, and any documented integration or CLI tools.
```

Filled example (paths vary by repo):

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=Load WORK_ITEM per docs/developer/agent-work-item-tracking.md.
```

## Where the agent should look (discovery order)

1. **Repo developer docs** — canonical. Maintain one shard (for example under `docs/developer/`) as part of local setup. Document how to load `WORK_ITEM`, branch conventions, validation commands, and how work is submitted for review.
2. **Repository context** — package scripts, config files, contribution guides, and integration metadata the repo already exposes. Use `--help`, tool schemas, or API docs present in the environment; do not assume a specific vendor or host.
3. **Local specs** — when there is no remote tracker, scope may live under `.work-items/{slug}/` (`user-story.md`, `design.md`, `task.md`).

## Setup once per repo (maintainers)

Add a work-item tracking shard during project setup — same tier as local setup and contributing guidelines. Link it from your setup doc so agents read it before the first task-type prompt.

## Delivery workflow

Document wrap-up and finalize steps in the same developer shard. Prompts refer to them generically; map terms to your repo's process (release notes, review workflow, commit policy).
