## FAQ: What MDCP is NOT

Before we wrap — the honest objections:

1. **Why not store project plans, tickets, or Cursor plans in the repo?**
2. **Why yet another doc tool? Aren't there a million already?**

---

## Why not store project plans, tickets, or Cursor plans in the repo?

- MDCP holds **hard, durable system context** — intent, architecture, terminology, edge cases, personas.
- Tickets and spikes **do** capture what happened — but future readers need the **outcome**, not the incident log or the path to the answer.
- Distill learnings into shards: new constraints, updated personas, how people use the system, why the system changed.
- The **story** lives in Linear, Jira, and your planning stack. The **durable result** lives in the repo.

---

## Why yet another doc tool?

- We're not replacing Docusaurus, MkDocs, or CI doc generators.
- MDCP is a **protocol** — like OpenAPI for HTTP APIs — for **documentation context contracts**.
- Doc sites and crawled corpora weren't built for granular, PR-reviewable, agent-first retrieval (`refs lookup`, one shard at a time).
- The pain isn't unique. The missing piece is a **shared standard** for validated intent that agents and humans consume the same way.

---
