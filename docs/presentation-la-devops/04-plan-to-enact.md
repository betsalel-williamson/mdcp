## Plan to Enact: Phased Delivery

- **V1: Authoring**
  - Agent Skills bootstrap
  - Agent tasks & skills
  - `mdcp compile` and validation
- **V2: Delivery (MCP Adapter)**
  - MDCP MCP server (shard read, glossary search)
- **V3: Hosted Context API**
  - OpenAPI spec, API keys, polyglot clients

---

## Getting Started: Agent Skills

Install the MDCP Agent Skill in your repo (`.agents/skills/mdcp/SKILL.md`):

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

- It's a **behavioral guide**, not a context dump.
- Tells agents how to compile, validate, and read shards one at a time.

Or use the CLI init to scaffold your docs:

```bash
npx @bwilliamson/mdcp-cli init --docs-root docs
mdcp compile --config docs/mdcp.config.json
```

---

## The 5-Minute Starting Point

This isn't a magic bullet that instantly understands your legacy codebase. It's a frictionless, 5-minute starting point that puts docs in the right place so they scale.

- Open **Cursor** (or any LLM tool) in a repo.
- Type: _"Help me write a new feature using the MDCP skill."_
- The agent reads `.agents/skills/mdcp/SKILL.md` automatically.
- Watch it set up your documentation shards and capture intent _before_ writing code.

---
