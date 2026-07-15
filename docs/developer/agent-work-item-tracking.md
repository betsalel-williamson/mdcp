# Agent work-item tracking

How coding agents load tracker issues and delivery conventions **for this repository**. Task-type subagents in [skills/mdcp/agents/](../../skills/mdcp/agents/) (also present under `.agents/skills/mdcp/agents/` after a local dogfood install) point here via `WORK_ITEM_LOOKUP`.

Configure an equivalent shard in consumer repos during [local setup](./local-setup.md).

## Tracker

```text
Host=GitHub (betsalel-williamson/mdcp)
Issue base URL=https://github.com/betsalel-williamson/mdcp/issues/
Project board=https://github.com/users/betsalel-williamson/projects/4
WORK_ITEM=issue number (e.g. 39) or full issue URL
```

All repo issues live on the public [MarkDown Context Protocol project board](https://github.com/users/betsalel-williamson/projects/4). **Status** tracks delivery (Todo / In Progress / Done); **Track** groups work by roadmap area (0.5 Spec & adoption, 1.0 Formalization, Maintenance, Performance, Future V2+). Move items to **In Progress** when you start a branch; set **Done** when the issue closes.

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

## Example intake answers

When a subagent asks for scope, answers can look like:

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=docs/developer/agent-work-item-tracking.md
```

Prefer stating the shard path for `WORK_ITEM_LOOKUP` so the agent loads tracker conventions from this file. For subagent catalog and invoke recipe, read [LLM collaboration](../client-cli/llm-collaboration.md).
