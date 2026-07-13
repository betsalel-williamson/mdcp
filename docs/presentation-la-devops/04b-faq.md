## Appendix: FAQ — What MDCP is NOT

Common objections for Q&A — skip during the main talk:

1. **Why not store project plans, tickets, or Cursor plans in the repo?**
2. **Why yet another doc tool? Aren't there a million already?**
3. **How does this integrate with my existing doc tools, and why give it a try?**

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

## How does this integrate with my existing doc tools, and why give it a try?

- **Integration, not replacement:** MDCP is designed to work alongside Docusaurus, MkDocs, Confluence exports, and whatever you already publish. Shards are the source of truth; if you still need monolithic files for publishing, `mdcp compile` and `mdcp export` can generate them.
- **Why try it if docs already work?** Docs that work for humans often still fail agents — context dumps, stale pages, and conflicting terms drive up inference cost and hallucinations. MDCP gives agents a **validated, granular contract** (`refs lookup`, one shard at a time) without throwing away your existing toolchain.
- **We need your feedback:** This is early alpha. Try it with your repo, your doc stack, and your agents — then tell us what breaks, what's missing, and what would make it worth adopting.

---

## How does MDCP ensure the code built matches the docs?

- It doesn't magically force compliance—it requires someone to use it productively.
- However, by making docs granular, machine-readable, and co-located with code, it allows AI agents (and CI pipelines) to continuously verify that the implementation aligns with the stated intent.
- It makes documentation the _blueprint_ for LLM code generation, rather than an afterthought.

---
