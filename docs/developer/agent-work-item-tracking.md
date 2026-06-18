# Agent work-item tracking

How coding agents load tracker issues and delivery conventions **for this repository**. Task-type prompts in [spec/extensions/prompts-mdcp-defaults/0.4.0.0/](../../spec/extensions/prompts-mdcp-defaults/0.4.0.0/) (cached at `.caches/mdcp/prompts/` after fetch) point here via `WORK_ITEM_LOOKUP`.

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

If none of the above apply, inspect enabled MCP tool descriptors or run `gh --help` / `gh issue view --help` before guessing commands.

## Git and delivery

```text
Integration branch=main (pull before branching)
Feature branches=descriptive (e.g. feature/issue-29-default-compile-hooks)
One branch per WORK_ITEM=do not mix unrelated features, designs, or doc scopes in one PR
Branch before work=create the feature branch before shards, tests, or code
Commits=conventional; atomic and logically grouped
Release notes=changeset in .changeset/ for user-facing doc changes
Docs=describe current behavior only; removed or breaking behavior belongs in changeset release notes, not feature/client shards
Code review=gh pr create; link WORK_ITEM in PR body (Closes #N when appropriate)
```

## Workflow best practices

1. **Load scope** — fetch WORK_ITEM (title, body, acceptance criteria) before planning or editing.
2. **Branch first** — `git checkout main`, pull, then `git checkout -b feature/...` tied to the issue. Never start on `main`.
3. **Stay focused** — one feature or design at a time. Treat acceptance criteria as the boundary unless WORK_ITEM explicitly expands scope.
4. **Docs describe now** — update shards to match as-built behavior. Do not document superseded workflows in `docs/features/` or `docs/client/`; record that in the changeset instead.

## Example prompt header

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=Branch from main (pull first). One issue per branch. Load WORK_ITEM per docs/developer/agent-work-item-tracking.md.
```

For task-type prompt templates, read [LLM collaboration](../client-cli/llm-collaboration.md).
