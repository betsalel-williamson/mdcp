# Usage model

Operational roles for Markdown as Context. Parent: [GitHub #45](https://github.com/betsalel-williamson/mdcp/issues/45).

## Agent entrypoint

Agents should read **`mdcp.v*.llms.txt`** in the docs root first — typically `mdcp.v0.4.llms.txt` (protocol `0.4.0.0`). That file explains how to query without loading entire guides.

## Actors and obligations

| Actor                    | Reads                                          | Writes           | Must run                                     |
| ------------------------ | ---------------------------------------------- | ---------------- | -------------------------------------------- |
| Author (human/agent)     | shards, `refs lookup`, bootstrap index         | shards, manifest | `check` before PR                            |
| CI                       | config                                         | —                | `check --require-lint` when peers configured |
| Agent (context consumer) | bootstrap index, `export --llm`, single shards | —                | —                                            |
| Maintainer               | spec + conformance                             | protocol shards  | `docs:check:repo`                            |

**Shards are source of truth; compiled files are generated.**

## Adoption paths

### Minimal

One guide, `compile` + `check`, monolith output. Fetch or copy `mdcp.v0.4.llms.txt` to docs root (`npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-ref v0.4.1 --fetch-profile alpha`).

### Standard

Multi-guide `compileOrder`, publish outputs (`compile.outputFile`), `refs lookup`.

### Agent-native

Above plus `export --llm`, three-tier shards (`features` / `client` / `developer`), task prompts from `spec/extensions/prompts-mdcp-defaults/0.4.0.0/` (cached at `.agents/skills/mdcp/agents/` after fetch).

## Coexistence

| Incumbent             | Workflow                                                     |
| --------------------- | ------------------------------------------------------------ |
| MCP host              | MCP reads compiled artifacts; MDCP validates authoring       |
| Static site generator | MDCP for in-repo agent context; site may use compiled subset |
| Cursor rules          | Host behavior in rules; product truth in MDCP shards         |

## Query preference order

1. Read `mdcp.v*.llms.txt` in docs root (agent index)
2. Load task prompt from `.agents/skills/mdcp/agents/` (or [spec/extensions/prompts-mdcp-defaults/0.4.0.0/](../../spec/extensions/prompts-mdcp-defaults/0.4.0.0/)) with `WORK_ITEM` set — see [Agent task prompts](./agent-task-prompts.md)
3. `mdcp refs lookup "<topic>"`
4. Read one shard from lookup result
5. `mdcp export --llm` only when broader context is required

Read [LLM collaboration](../../client-cli/llm-collaboration.md) for prompts and workflow index.
