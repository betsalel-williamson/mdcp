# Usage model

Operational roles for Markdown as Context. Parent: [GitHub #45](https://github.com/betsalel-williamson/mdcp/issues/45).

## Agent entrypoint

Agents should read **`mdcp.v*.llms.txt`** in the docs root first — typically `mdcp.v0.4.llms.txt` (protocol `0.4.0.0`). That file explains how to query without loading entire guides.

## Actors and obligations

| Actor                    | Reads                                                     | Writes           | Must run                                     |
| ------------------------ | --------------------------------------------------------- | ---------------- | -------------------------------------------- |
| Author (human/agent)     | shards, bootstrap index                                   | shards, manifest | `check` before PR                            |
| CI                       | config                                                    | —                | `check --require-lint` when peers configured |
| Agent (context consumer) | bootstrap index, single shards (`rg`/IDE), `export --llm` | —                | —                                            |
| Maintainer               | spec + conformance                                        | protocol shards  | `docs:check:repo`                            |

**Shards are source of truth; compiled files are generated.**

## Adoption paths

### Minimal

One guide, `compile` + `check`, monolith output. Fetch or copy `mdcp.v0.4.llms.txt` to docs root (`npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-ref v0.4.1 --fetch-profile alpha`).

### Typical

Multi-guide `compileOrder`, publish outputs (`compile.outputFile`).

### Agent-native

Above plus `export --llm`, three-tier shards (`features` / `client` / `developer`), task subagents from `skills/mdcp/agents/` (install target `.agents/skills/mdcp/agents/`).

## Coexistence

| Incumbent             | Workflow                                                     |
| --------------------- | ------------------------------------------------------------ |
| MCP host              | MCP reads compiled artifacts; MDCP validates authoring       |
| Static site generator | MDCP for in-repo agent context; site may use compiled subset |
| Cursor rules          | Host behavior in rules; product truth in MDCP shards         |

## Query preference order

1. Activate the parent Agent Skill (`/mdcp`) when available
2. Load a task subagent from `skills/mdcp/agents/` (or [skills/mdcp/agents/](../../skills/mdcp/agents/)); complete intake for `WORK_ITEM` — see [Agent task subagents](./agent-task-prompts.md)
3. Discover the shard with host tools (`rg`, IDE search, guide `index.md`) and **read one shard**
4. Rely on `mdcp check` for broken `#` cross-links (optionally inspect `mdcp refs list`)
5. `mdcp export --llm` only when broader context is required

Read [LLM collaboration](../../client-cli/llm-collaboration.md) for subagent catalog and workflow index.
