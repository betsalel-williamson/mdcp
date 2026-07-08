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
