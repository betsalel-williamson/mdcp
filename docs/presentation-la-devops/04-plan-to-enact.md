## Plan to Enact: Phased Delivery

- **V1: Authoring**
  - `mdcp.v0.4.llms.txt` bootstrap + agent task prompts + `mdcp export --llms-index`.
- **V2: Delivery (MCP Adapter)**
  - MDCP MCP server (`refs lookup`, shard read, glossary search).
- **V3: Hosted Context API**
  - OpenAPI spec, API keys, polyglot clients.

---

## Getting Started: V1 Bootstrap

Drop `mdcp.v0.4.llms.txt` in your docs root.

- It's a **short index**, not a context dump.
- Agents inspect your repo and walk through config and shard layout.

Or use the CLI init:

```bash
npx @bwilliamson/mdcp-cli init --docs-root docs
mdcp compile --config docs/mdcp.config.json
```

---

## The 5-Minute Starting Point

This isn't a magic trick that instantly understands your legacy codebase. It's a frictionless, 5-minute starting point to establish the MDCP foundation.

- Open **Cursor** (or any LLM tool) in a repo.
- Copy-paste the bootstrap prompt from `mdcp.v0.4.llms.txt`, or ask the agent to install and configure MDCP from the existing docs.
- Watch the agent set up the pipeline — proving how easy it is to begin the long-term journey of capturing intent.

---
