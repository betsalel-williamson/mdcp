## Appendix: FAQ — What MDCP is NOT

Common objections for Q&A — skip during the main talk:

1. **Why not store project plans, tickets, or Cursor plans in the repo?**
2. **Why yet another doc tool? Aren't there a million already?**
3. **How does this integrate with my existing doc tools?**
4. **How does MDCP ensure the code built matches the docs?**

---

## Why not store project plans or tickets in the repo?

- MDCP holds **hard, durable system context** — intent, architecture, terminology.
- Tickets and spikes capture what happened — but future readers need the **outcome**, not the incident log.
- Distill learnings into shards: new constraints, updated personas, why the system changed.
- The **story** lives in Jira/Linear. The **durable result** lives in the repo.

---

## Why yet another doc tool?

- We're not replacing Docusaurus, MkDocs, or CI doc generators.
- MDCP is a **protocol** (like OpenAPI for HTTP APIs) for **documentation context contracts**.
- Doc sites weren't built for granular, PR-reviewable, agent-first retrieval (`refs lookup`).
- The missing piece is a **shared standard** for validated intent that agents and humans consume the same way.

---

## How does this integrate with my existing doc tools?

- **Integration, not replacement:** MDCP works alongside Docusaurus, MkDocs, Confluence exports.
- Shards are the source of truth. If you need monolithic files, `mdcp compile` generates them.
- **Why try it?** Docs that work for humans often fail agents (context dumps, conflicting terms).
- MDCP gives agents a **validated, granular contract** without throwing away your existing toolchain.

---

## How does MDCP ensure the code built matches the docs?

- It doesn't magically force compliance—it requires someone to use it productively.
- By making docs granular, machine-readable, and co-located with code, it allows AI agents to continuously verify implementation aligns with intent.
- It makes documentation the _blueprint_ for LLM code generation, rather than an afterthought.

---
