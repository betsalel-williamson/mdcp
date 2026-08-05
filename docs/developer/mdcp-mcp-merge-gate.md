# mdcp-mcp and merge gate

The `@bwilliamson/mdcp-mcp` package delivers **merge-gate review** tooling and will evolve into a full Model Context Protocol server. It is separate from `@bwilliamson/mdcp-cli` and `@bwilliamson/mdcp-core`.

| Package                  | Role                                                     |
| ------------------------ | -------------------------------------------------------- |
| `mdcp-core` / `mdcp-cli` | Documentation compile, lint, and structural `mdcp check` |
| `mdcp-mcp`               | Merge-queue agentic review, MCP-light tools, PR comments |

`mdcp-mcp` spawns `mdcp check` as a subprocess when needed — it does **not** import `mdcp-core`.

## Skill boundaries

| Path              | Purpose                                         | MCP upstream skills? |
| ----------------- | ----------------------------------------------- | -------------------- |
| `skills/`         | MDCP install surface (`mdcp`, `mdcp-*` helpers) | **No**               |
| `.agents/skills/` | Maintainer dogfood + upstream MCP dev skills    | **Yes**              |
| `tests/skills/`   | Live-eval fixtures                              | No                   |

Upstream MCP skills (`mcp-builder`, `build-mcp-server`) are installed to `.agents/skills/` via `pnpm skill:update` and tracked in `skills-lock.json`. They are **not** vendored into `skills/` and are **not** validated by `pnpm skill:validate`.

### Maintainer installs

```bash
# Add or refresh upstream MCP skills (writes .agents/skills/, updates skills-lock.json)
npx skills add anthropics/skills --skill mcp-builder
npx skills add anthropics/claude-plugins-official --skill build-mcp-server

# Refresh all dogfood installs (MDCP helpers from skills/ + upstream from lock)
pnpm skill:update
```

| Skill              | Source                                                                                                          | When to invoke                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `mcp-builder`      | [anthropics/skills](https://www.skills.sh/anthropics/skills/mcp-builder)                                        | Designing MCP tool surfaces    |
| `build-mcp-server` | [anthropics/claude-plugins-official](https://www.skills.sh/anthropics/claude-plugins-official/build-mcp-server) | Wiring stdio / HTTP MCP server |
| `skill-creator`    | anthropics/skills                                                                                               | Refresh skill packs on cadence |
| `writing-skills`   | obra/superpowers                                                                                                | Skill quality passes           |

See [Build with Agent Skills](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-with-agent-skills) for the official MCP + skills workflow.

## MCP-light CLI

Build first (`pnpm --filter @bwilliamson/mdcp-mcp build`), then:

| Command                                | Purpose                               |
| -------------------------------------- | ------------------------------------- |
| `mdcp-mcp tools`                       | JSON tool descriptors for agent hosts |
| `mdcp-mcp call <tool> --args '{}'`     | Invoke one read/write tool            |
| `mdcp-mcp brief [--pr N]`              | Review brief JSON for offline agents  |
| `mdcp-mcp run [--pr N] [--agent]`      | Merge gate orchestrator               |
| `mdcp-mcp submit --findings file.json` | Post agent findings to PR             |

Read-only tools: `work_item_get`, `pr_get`, `diff_list`, `file_read`, `docs_related`, `check_programmatic`, `check_mdcp`, `review_rubric`. Write tool: `pr_comment` (sticky `<!-- mdcp-merge-gate -->` comment).

Set `GITHUB_TOKEN` (or `GH_TOKEN`) with `pull-requests: write` to post comments. Optional `ANTHROPIC_API_KEY` enables agentic review in `mdcp-mcp run --agent`.

## Merge gate CI

GitHub **merge queue** runs `.github/workflows/mdcp-merge-gate.yml` on `merge_group` events (and `workflow_dispatch` for manual reruns).

1. **Structural** — `pnpm docs:check`, `pnpm skill:validate`, `pnpm docs:compile`, `git diff --exit-code`
2. **Agentic** — `mdcp-mcp run` with MCP-light tools and the embedded MDCP helper rubric (not a new skill)

On failure, the workflow posts a sticky PR comment with manual steps and pointers to existing helpers (`/mdcp-feature-level`, `/mdcp-doc-only`, `/mdcp-design-architecture`).

### Fast vs full CI

| Event            | Workflow              | Gates                                             |
| ---------------- | --------------------- | ------------------------------------------------- |
| `pull_request`   | `ci.yml`              | Fast: audit, typecheck, lint, format, build, test |
| `merge_group`    | `mdcp-merge-gate.yml` | Docs, skills, merge review                        |
| `push` to `main` | `ci.yml`              | Full safety net (includes docs and skills)        |

Enable merge queue on `main` in repository settings so PRs run the merge gate before landing.

### Local dry run

```bash
pnpm build
GITHUB_TOKEN=ghp_... mdcp-mcp run --pr 123 --no-agent
```

Use `--brief-only` to print the agent brief without posting a comment.
