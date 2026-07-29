# Usage model

Operational roles for Markdown as Context. Parent: [GitHub #45](https://github.com/betsalel-williamson/mdcp/issues/45).

## Agent entrypoint

Agents should load the parent **Agent Skill** (`/mdcp`, installed in your agent's skills directory via `npx skills add`) first. That skill teaches how to query with smallest context — discover one shard at a time — without loading entire guides. See [Agent Skill](../../features/agent-skill.md).

## Actors and obligations

| Actor                    | Reads                                 | Writes            | Must run                                                                       |
| ------------------------ | ------------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| Author (human/agent)     | shards, Agent Skill                   | shards, manifest  | `check` before PR                                                              |
| CI                       | config                                | —                 | `check --require-lint` when peers configured; optional `evaluate-doc-coverage` |
| Automation adapter       | changed paths, evaluator JSON         | comments / checks | gather paths → `evaluate-doc-coverage` → route by `status`                     |
| Agent (context consumer) | Agent Skill, single shards (`rg`/IDE) | —                 | —                                                                              |
| Maintainer               | skill pack + conformance              | protocol shards   | `docs:check:repo`                                                              |

**Shards are source of truth; compiled files are generated.**

## Docs coverage evaluation (automation)

When a PR or push changes product code, contributor tooling, or packaging without matching shards, hosts run [docs coverage evaluation](../doc-coverage-evaluation.md) (`mdcp evaluate-doc-coverage`). The evaluator is the portable contract; Cursor Automations, GitHub Actions, and other systems are thin adapters that supply paths and render the JSON verdict (`covered`, `missing_docs`, or `needs_clarification`).

Start in **advisory** mode; enable **gate** mode when heuristics fit the repo. On `needs_clarification`, surface the evaluator's `questions` to a human before inventing doc scope — then hand off to the [doc-only helper](./skills/mdcp-doc-only.md) when authoring is needed.

## Adoption paths

### Minimal

One guide, `compile` + `check`, monolith output. Install the parent skill (`npx skills add betsalel-williamson/mdcp --skill mdcp`).

### Typical

Multi-guide `compileOrder`, publish outputs (`compile.outputFile`).

### Agent-native

Above plus three-tier shards (`features` / `client` / `developer`), helper skills.

## Coexistence

| Incumbent             | Workflow                                                     |
| --------------------- | ------------------------------------------------------------ |
| MCP host              | MCP reads compiled artifacts; MDCP validates authoring       |
| Static site generator | MDCP for in-repo agent context; site may use compiled subset |
| Cursor rules          | Host behavior in rules; product truth in MDCP shards         |
| Host automations      | Adapter gathers diffs; CLI evaluator owns taxonomy + verdict |

## Query preference order

1. Activate the parent Agent Skill (`/mdcp`) when available
2. Load a helper skill; complete intake for `WORK_ITEM` — see [Agent helper skills](./agent-task-prompts.md)
3. Discover the shard with host tools (`rg`, IDE search, guide `index.md`) and **read one shard**
4. Rely on `mdcp check` for broken `#` cross-links (optionally inspect `mdcp refs-list`)

Read [`docs/skills.md`](../../../docs/skills.md) for the helper skills catalog and workflow index.
