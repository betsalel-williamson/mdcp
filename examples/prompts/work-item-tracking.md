# Work item tracking (prompt setup)

Task-type prompts use **two replacements at the top** — edit those lines, then send the rest unchanged.

## Placeholders

| Placeholder            | Replace with                                                                   |
| ---------------------- | ------------------------------------------------------------------------------ |
| `{{WORK_ITEM}}`        | Ticket ID or URL — linked in the code review at the end                        |
| `{{WORK_ITEM_LOOKUP}}` | Full setup: branch, sync, and how to load scope (CLI, MCP, or local spec path) |

Everything below **Replace before sending** is static. The body refers to "the work item above" and "the lookup line above."

## Lookup examples

Paste one of these (or your own) into `{{WORK_ITEM_LOOKUP}}`:

**GitHub CLI**

```text
Branch from main (pull first). Run gh issue view 39 --comments.
```

**GitLab CLI**

```text
Branch from main (pull first). Run glab issue view 12.
```

**Linear MCP**

```text
Branch from main (pull first). Use the Linear MCP to load issue ENG-123 (title, description, acceptance criteria, comments).
```

**Notion MCP**

```text
Branch from main (pull first). Use the Notion MCP to load page [page-id] and linked spec subpages.
```

**GitHub MCP**

```text
Branch from main (pull first). Use the GitHub MCP to load issue 39 including description and discussion.
```

**Local specs (no tracker)**

```text
Branch from main (pull first). Read .work-items/user-auth/user-story.md, design.md, and task.md as the scope contract.
```

## Work item examples

| Tracker | `{{WORK_ITEM}}` example                              |
| ------- | ---------------------------------------------------- |
| GitHub  | `39` or `https://github.com/org/repo/issues/39`      |
| Linear  | `ENG-123`                                            |
| GitLab  | `12` or full issue URL                               |
| Notion  | Page URL or ID                                       |
| Local   | `user-auth` (slug matching `.work-items/user-auth/`) |

## Delivery workflow

Map wrap-up and finalize steps to your repo:

| Prompt phrase         | Common equivalents                                        |
| --------------------- | --------------------------------------------------------- |
| changeset / changelog | Changesets, `CHANGELOG.md`, release-drafter, tracker note |
| pull request / PR     | GitHub PR, GitLab MR, Gerrit change, Phabricator diff     |
| atomic commits        | Conventional commits, signed commits, or team policy      |
