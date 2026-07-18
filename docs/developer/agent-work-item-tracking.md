# Agent work-item tracking

How coding agents load tracker issues and delivery conventions **for this repository**. Helper skills in [Helper Skills](../../docs/skills.md) (installed alongside the MDCP CLI) point here via `WORK_ITEM_LOOKUP`.

**This repo’s work-item lookup system uses GitHub** for both **issues** (acceptance, discussion, `Closes #N`) and **project planning** (the Project board below — status, track, roadmap grouping). Do not invent a second tracker or stuff tickets / sprint backlogs into durable `docs/` shards; load scope from GitHub via this shard.

Configure an equivalent shard in consumer repos during [local setup](./local-setup.md) (point `WORK_ITEM_LOOKUP` at whatever issue tracker and project-planning host that repo uses).

## Tracker

```text
Host=GitHub (betsalel-williamson/mdcp)
Issues=https://github.com/betsalel-williamson/mdcp/issues/  (record WORK_ITEMs here)
Project board=https://github.com/users/betsalel-williamson/projects/4  (project plan / delivery board)
Issue base URL=https://github.com/betsalel-williamson/mdcp/issues/
WORK_ITEM=enough to resolve the issue — number, URL, or short name/description
```

All repo issues live on the public [MarkDown Context Protocol project board](https://github.com/users/betsalel-williamson/projects/4). **Status** tracks delivery (Todo / In Progress / Done); **Track** groups work by roadmap area (0.5 Spec & adoption, 1.0 Formalization, Maintenance, Performance, Future V2+). Move items to **In Progress** when you start a branch; set **Done** when the issue closes. Every open issue should appear on that board.

## Issue priority (value-add)

Use **one** mutually exclusive GitHub label so the board and `gh issue list` stay sortable. These labels are **issue triage priority**, not the product capability tiers in [Personas and priority tiers](../features/personas-and-priority-tiers.md).

| Label            | Meaning                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `priority:P0`    | User-facing blocker or broken core path (compile / check / refs)      |
| `priority:P1`    | High near-term value — do next after P0                               |
| `priority:P2`    | Important backlog — clear value, not next                             |
| `priority:P3`    | Nice-to-have / polish / low urgency                                   |
| `priority:defer` | Parked on an explicit gate (benchmark, V2 dependency, adopter demand) |

### How priority is set

1. **Issue forms** — Bug report and Feedback templates require a **Value-add priority** dropdown. That choice is recorded in the issue body.
2. **Labels** — Maintainers or coding agents apply the matching `priority:*` label when triaging (GitHub forms cannot map a dropdown to a label automatically). Replace any previous `priority:*` label so only one remains.
3. **What to work on next** — Prefer open issues labeled `priority:P0`, then `P1`. Skip `priority:defer` until the gate in the issue body is met.

Issue templates live under `.github/ISSUE_TEMPLATE/`. Adoption stories do not require a priority dropdown (qualitative evidence, not a delivery backlog item).

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
Commits=conventional; one concern per commit ([Atomic commit groups](../glossary/atomic-commit-groups.md))
Atomic commit groups=coding and multi-concern plans MUST list numbered groups before “go” (id/name, one concern, exact files, conventional commit subject); after approval, `git commit` one group at a time — do not squash unrelated concerns
Release notes=changeset in .changeset/ for published package changes (temporary until versioned into CHANGELOGs)
Docs=describe current behavior only; removed or breaking behavior belongs in changeset → package CHANGELOG, not feature/client shards
ADRs=docs/features/adr/ (scope/removal decisions; link CHANGELOGs, never pending .changeset/*.md)
Code review=gh pr create; link WORK_ITEM in PR body (Closes #N when appropriate)
```

Parent skill QA and day-to-day helpers encode the same rule so plan-only agents inherit it: [Agent Skill](../features/agent-skill.md#quality-assurance-qa-principles), [Helper Skills](../features/protocol/agent-task-prompts.md).

## Workflow best practices

1. **Load scope** — fetch WORK_ITEM (title, body, acceptance criteria) before planning or editing.
2. **Branch first** — `git checkout main`, pull, then `git checkout -b feature/...` tied to the issue. Never start on `main`.
3. **Stay focused** — one feature or design at a time. Treat acceptance criteria as the boundary unless WORK_ITEM explicitly expands scope.
4. **Plan Atomic commit groups** — before waiting for human review / implementation, include numbered commit groups for multi-concern work (see [Git and delivery](#git-and-delivery)). After approval, land one group per commit.
5. **Docs describe now** — update shards to match as-built behavior. Do not document superseded workflows in `docs/features/` or `docs/client/`; record consumer notice in the changeset (lands in package CHANGELOGs). Never link durable shards or ADRs to pending `.changeset/*.md` files.
6. **Add a changeset** — run `pnpm changeset` (or manually create a `.changeset/*.md` file) if you changed published package behavior. This is required for release notes and versioning.
7. **Triage priority** — when opening or reviewing issues, ensure exactly one `priority:*` label matches the template dropdown (see [Issue priority](#issue-priority-value-add)).

## Example intake answers

When a subagent asks for scope, answers can look like:

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=docs/developer/agent-work-item-tracking.md
```

```text
WORK_ITEM=default compile hooks
WORK_ITEM_LOOKUP=GitHub
```

`WORK_ITEM` may be an issue number, URL, or a short name/description the agent can resolve. `WORK_ITEM_LOOKUP` may be this shard path or a plain location (e.g. GitHub) that points the agent at the tracker conventions here. For the helper skills catalog and invoke recipes, read [`docs/skills.md`](../../docs/skills.md).
