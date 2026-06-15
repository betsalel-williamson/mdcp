# Work item tracking (prompt setup)

Task-type prompts in this directory use placeholders for **your** project-management stack. mdcp does not require a specific tracker — wire whichever tool your agent can reach.

## Placeholders

| Placeholder       | Replace with                                                            |
| ----------------- | ----------------------------------------------------------------------- |
| `{{WORK_ITEM}}`   | Issue/ticket ID, URL, Linear issue key, Notion page, or local spec path |
| `{{BASE_BRANCH}}` | Your team's integration branch (often `main` or `master`)               |
| `{{FEATURE}}`     | Short feature slug (used in `.work-items/` paths and doc shards)        |

Paste a prompt, fill placeholders, then add **one** lookup instruction for your tracker (below).

## Option A — Shell CLI

**GitHub**

```bash
gh issue view 39 --comments
# or: gh issue view https://github.com/org/repo/issues/39
```

**GitLab**

```bash
glab issue view 12
```

**Jira** (when `jira` CLI is configured)

```bash
jira issue view PROJ-123
```

In the prompt **Setup** line, tell the agent which command to run, for example:

```markdown
**Setup:** Branch from `main`. Run `gh issue view {{WORK_ITEM}} --comments` and treat it as the source of truth for scope.
```

## Option B — MCP servers

When your agent has MCP tools enabled, prefer them over shell CLIs — they return structured data and respect auth already configured in the IDE.

**Linear** — fetch the issue by ID or key:

```markdown
**Setup:** Branch from `main`. Use the Linear MCP to load issue {{WORK_ITEM}} (title, description, acceptance criteria, and comments).
```

**Notion** — fetch a page or database row:

```markdown
**Setup:** Branch from `main`. Use the Notion MCP to load page {{WORK_ITEM}} and any linked spec subpages.
```

**GitHub** — via GitHub MCP instead of `gh`:

```markdown
**Setup:** Branch from `main`. Use the GitHub MCP to load issue {{WORK_ITEM}} including description and discussion.
```

Adapt tool names to whatever your MCP server exposes (`get_issue`, `get_page`, etc.).

## Option C — Local spec files (no tracker)

For greenfield work or air-gapped repos, the work item **is** the spec under `.work-items/`:

```markdown
**Setup:** Branch from `main`. Read `.work-items/{{FEATURE}}/user-story.md`, `design.md`, and `task.md` as the scope contract. Do not expand beyond them.
```

`@`-reference those files in Cursor, or paste their contents into the agent session.

## Delivery workflow placeholders

Task prompts also mention release notes and code review. Map these to your repo:

| Prompt phrase         | Common equivalents                                        |
| --------------------- | --------------------------------------------------------- |
| changeset / changelog | Changesets, `CHANGELOG.md`, release-drafter, tracker note |
| pull request / PR     | GitHub PR, GitLab MR, Gerrit change, Phabricator diff     |
| atomic commits        | Conventional commits, signed commits, or team policy      |

Example **Finalize** customization:

```markdown
**Finalize:** Open a merge request in GitLab, link {{WORK_ITEM}}, and request review from {{REVIEWERS}}.
```

## Composing a full Setup block

Minimal template — copy into any task prompt:

```markdown
**Setup:** Create a feature branch from `{{BASE_BRANCH}}` (sync with remote first). Load work item {{WORK_ITEM}} using [your tracker: CLI, MCP, or `.work-items/` spec files]. Treat tracker acceptance criteria as the scope boundary.
```
