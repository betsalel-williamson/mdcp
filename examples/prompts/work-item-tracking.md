# Work item tracking (prompt setup)

Task-type prompts use a **Replace before sending** code block at the top — fill in the values, then send the rest unchanged.

## Replace block

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

- **`WORK_ITEM`** — ticket ID, URL, or local spec slug (linked in the code review)
- **`WORK_ITEM_LOOKUP`** — where and how the agent loads scope (see below — not every tool listed here)

The prompt body refers to `WORK_ITEM` and `WORK_ITEM_LOOKUP` by name. Everything below the code block is static.

## What goes in `WORK_ITEM_LOOKUP`

Do **not** try to list every tracker, CLI, and MCP in this file. Each repo documents its own stack once in **developer docs**. The lookup line points the agent there and tells it to discover the rest.

Use a pattern like:

```text
WORK_ITEM_LOOKUP=Branch from main (pull first). Load WORK_ITEM using this repo's developer docs (work-item tracking section). If those docs are silent, inspect enabled MCP tool schemas, tracker CLIs on PATH, or local .work-items/ specs.
```

Example after your repo documents its setup:

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=Branch from main (pull first). Load WORK_ITEM per docs/developer/agent-work-item-tracking.md.
```

## Where the agent should look (discovery order)

When `WORK_ITEM_LOOKUP` sends the agent to your developer docs, that shard should answer “how do we load a work item here?” The agent can also self-serve from:

1. **Repo developer docs** — canonical; maintain one shard (for example `docs/developer/agent-work-item-tracking.md`) as part of local setup. State tracker, branch convention, review/release steps, and the preferred load path (CLI command, MCP server name, or local spec directory).
2. **Enabled MCP servers** — list available MCP tools and their schemas in the IDE; use the server that matches your tracker (GitHub, Linear, Notion, Jira, and so on).
3. **Shell CLIs on PATH** — run `--help` on whatever your team installs (`gh`, `glab`, `jira`, etc.); do not assume a specific tool unless developer docs name it.
4. **Local specs** — when there is no remote tracker, scope lives under `.work-items/{slug}/` (`user-story.md`, `design.md`, `task.md`).

## Setup once per repo (maintainers)

Add a **work-item tracking** shard to `docs/developer/` during project setup — same tier as local setup and contributing guidelines. Link it from your setup doc so contributors and agents find it before the first task-type prompt.

This repository dogfoods that pattern: [Agent work-item tracking](https://github.com/betsalel-williamson/mdcp/blob/main/docs/developer/agent-work-item-tracking.md).

## Delivery workflow

Map wrap-up and finalize steps to your repo (document these in the same developer shard):

| Prompt phrase         | Common equivalents                                        |
| --------------------- | --------------------------------------------------------- |
| changeset / changelog | Changesets, `CHANGELOG.md`, release-drafter, tracker note |
| pull request / PR     | GitHub PR, GitLab MR, Gerrit change, Phabricator diff     |
| atomic commits        | Conventional commits, signed commits, or team policy      |
