# Work item tracking (prompt setup)

Task-type prompts use a **Replace before sending** code block at the top — fill in the values, then send the rest unchanged.

## Replace block

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

Example:

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=Branch from main (pull first). Run gh issue view 39 --comments.
```

The prompt body refers to `WORK_ITEM` and `WORK_ITEM_LOOKUP` by name. Everything below the code block is static.

## Lookup examples

Paste into `WORK_ITEM_LOOKUP` (one line):

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

```text
WORK_ITEM=39
WORK_ITEM=https://github.com/org/repo/issues/39
WORK_ITEM=ENG-123
WORK_ITEM=user-auth
```

## Delivery workflow

Map wrap-up and finalize steps to your repo:

| Prompt phrase         | Common equivalents                                        |
| --------------------- | --------------------------------------------------------- |
| changeset / changelog | Changesets, `CHANGELOG.md`, release-drafter, tracker note |
| pull request / PR     | GitHub PR, GitLab MR, Gerrit change, Phabricator diff     |
| atomic commits        | Conventional commits, signed commits, or team policy      |
