# Agent work-item tracking

How coding agents load tracker issues and delivery conventions **for this repository**. Task-type prompts in [examples/prompts/](../../examples/prompts/) point here via `WORK_ITEM_LOOKUP`.

Configure an equivalent shard in consumer repos during [local setup](./local-setup.md).

## Tracker

```text
Host=GitHub (betsalel-williamson/mdcp)
Issue base URL=https://github.com/betsalel-williamson/mdcp/issues/
WORK_ITEM=issue number (e.g. 39) or full issue URL
```

## Load scope (pick what your agent has)

**GitHub CLI** (when `gh` is on `PATH` and authenticated):

```bash
gh issue view <number> --comments
```

**GitHub MCP** (when enabled in Cursor or another host): use GitHub issue tools to fetch the issue named in `WORK_ITEM` — title, body, labels, and comments.

**No remote access:** read local specs under `.work-items/{slug}/` if the task was spec-driven instead of tracker-driven.

If none of the above apply, inspect enabled MCP tool descriptors or run `gh --help` / `gh issue view --help` before guessing commands.

## Git and delivery

```text
Integration branch=main (pull before branching)
Feature branches=descriptive (e.g. docs/issue-39-llm-prompt-templates)
Commits=conventional; atomic and logically grouped
Release notes=changeset in .changeset/ for user-facing doc changes
Code review=gh pr create; link WORK_ITEM in PR body (Closes #N when appropriate)
```

## Example prompt header

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=Branch from main (pull first). Load WORK_ITEM per docs/developer/agent-work-item-tracking.md.
```

For task-type prompt templates, read [LLM collaboration](../client-cli/llm-collaboration.md).
