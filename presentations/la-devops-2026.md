---
marp: true
theme: default
paginate: true
---

## Intent is the New Syntax

### Introducing the MarkDown Context Protocol (MDCP)

**LA DevOps Community**
**July 30, 2026**
[LA DevOps Meetup Group](https://www.meetup.com/meetup-group-zzqwjltm/)

---

### About Me: Betsalel (Saul) Williamson

- **Co-founder and COO, Bitstream Labs, Inc.**
  - Accelerating AI deployments on FPGAs
  - Bridging hardware-software integration with data-driven business execution
- **Mission-Critical Operations**
  - Lead DevOps Engineer for lunar logistics at Astrobotic
  - Coordinated technical specs for the U.S. Navy Nuclear Program (BPMI)
- **Community Leadership**
  - DORA Community Guide (DevOps & Change Management)
  - LGBT+ and disability advocate (auadhdh and sensory sensitivities)

---

### The Journey

- From mission-critical aerospace to fast-moving AI startups.
- The zero-fail mindset of the nuclear program applied to software engineering.
- **The Core Thesis:** "Intent is the New Syntax." As AI accelerates code generation, capturing _why_ we build is more critical than _how_ we build.
- **The Payoff:** Documenting intent is hard, real work. Tonight, we'll look at a framework that makes this work pay off permanently—writing docs _once_ that serve both your team and your AI agents.

---

### The Problem: The $2.4T Cost of Software Failures

- **$2.41 trillion** total cost of poor software quality in the US (2022).
- **~$1.8 trillion** of that from operational software failures.
- **$1.52 trillion** in rapidly accumulating technical debt.
- _Source: [Consortium for Information & Software Quality (CISQ) 2022 CPSQ Report](https://www.it-cisq.org/wp-content/uploads/sites/6/2022/11/CPSQ-Report-Nov-22-2.pdf)_

**The Root Cause: "Documentation Debt" & Lost Intent**
As defined by [IBM](https://community.ibm.com/community/user/blogs/frank-de-gilio/2026/05/28/the-repository-knows-why), this happens when requirements fail to match what was actually built. When problems are solved in code but never make it back to the PRD, we lose **traceability**.

---

### The Trillion-Dollar Graveyard

- **Lost Context:** Invisible solutions to unknown problems become load-bearing features.
- **The AI Amplifier ([GitClear 2024/2025](https://gitclear-public.s3.us-west-2.amazonaws.com/GitClear-AI-Copilot-Code-Quality-2025.pdf)):** AI generation increased duplicate code 8x while healthy refactoring dropped below 10%.
- **The Verification Tax ([DORA 2026](https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report/)):** Reviewing AI code is creating massive bottlenecks. Without traceability to original intent, AI just generates legacy technical debt at scale.

---

### Context Overload

- Large documentation dumps (monolithic READMEs, site-wide `llms.txt`) pollute agent reasoning.
- Massive context dumps increase latency, drive up inference costs, and trigger hallucinations from conflicting legacy terms.
- Teams lack a shared, reviewable contract for **what documentation means**.

---

### How do you eat an elephant?

_One spoon at a time._

**How do we solve a $2.4 Trillion problem?**

_One bit of context at a time._

---

### Shared Language / Terminology

Before we dive in — a few terms we'll use throughout:

- **Shard:** A small, focused markdown file containing specific context (like a single concept, persona, or architecture decision).
- **refs lookup:** How an AI agent searches for and retrieves only the specific shards it needs, rather than reading the entire documentation at once.
- **MCP (Model Context Protocol):** An open standard that enables AI assistants to access external data sources and tools.
- **llms.txt:** A standard file that helps AI models navigate a project's documentation.
- **PRD:** Product Requirements Document.

---

### The Alternate Vision: MDCP

**MarkDown Context Protocol (MDCP)** is an open, repo-local standard for **system context**.

- Like OpenAPI is for HTTP APIs, but for **intent, design, and terminology**.
- **Small shards** are the source of truth.
- Agents pull **one section at a time** via `refs lookup` or single shard reads.
- **The Relief:** Write your documentation *once*. It serves as an onboarding guide for humans and a machine-readable context protocol for AI. No more explaining your architecture to every new agent.

---

### Cross-Functional Collaboration

To survive the AI era, we must bring everyone to the front of the line:

- Product Managers (defining the "why")
- FinOps
- Technical Writers (wrangling the "how")
- System Architects
- QA Engineers & Support Staff

**MDCP restores a healthy, collaborative engineering culture.**

---

### Who is MDCP For? (The Personas)

MDCP is designed for specific goals, matching the diverse roles in this very room:

- **The Champion (Engineering Managers):** You need to slash Mean Time To Recovery (MTTR) during incidents and accelerate developer onboarding. MDCP gives your agents and junior devs instant, accurate context to solve problems safely.
- **The Builder (Senior/Junior Engineers):** You integrate MDCP into the repo. You get one validation gate for humans, agents, and CI.
- **The Author (PMs, Tech Writers):** You write the shards. You focus on one topic per file without fighting the toolchain.
- **The Learner (Spectators, Juniors):** You paste a prompt into your agent and let it set up the pipeline while you learn the commands.

---

### Policies to Achieve the Vision

The bottleneck is no longer code syntax. It's our ability to accurately architect systems. Your docs must capture:

1. **Intent and Value:** Why does this exist?
2. **User Personas:** Who is suffering without this?
3. **System Realities:** Is this a greenfield prototype, or a 30-year-old legacy system?

---

### Core MDCP Principles

- **High level over implementation:** Shards hold plan, constraints, and acceptance criteria; code holds _how_.
- **Glossary as first-class:** Domain terms and legacy disambiguation live in dedicated shards.
- **Document before build/migrate:** Capture context in shards before greenfield work.
- **Granular, safe context:** `refs lookup` → single shard.
- **Open standard & Extensions:** `docs/extensions/` locally; shared packs in `spec/extensions/`.

---

### Plan to Enact: Phased Delivery

- **V1: Authoring**
  - `mdcp.v0.4.llms.txt` bootstrap + agent task prompts + `mdcp export --llms-index`.
- **V2: Delivery (MCP Adapter)**
  - MDCP MCP server (`refs lookup`, shard read, glossary search).
- **V3: Hosted Context API**
  - OpenAPI spec, API keys, polyglot clients.

---

### Getting Started: V1 Bootstrap

Drop `mdcp.v0.4.llms.txt` in your docs root.

- It's a **short index**, not a context dump.
- Agents inspect your repo and walk through config and shard layout.

Or use the CLI init:

```bash
npx @bwilliamson/mdcp-cli init --docs-root docs
mdcp compile --config docs/mdcp.config.json
```

---

### The 5-Minute Starting Point

This isn't a magic trick that instantly understands your legacy codebase. It's a frictionless, 5-minute starting point to establish the MDCP foundation.

- Open **Cursor** (or any LLM tool) in a repo.
- Copy-paste the bootstrap prompt from `mdcp.v0.4.llms.txt`, or ask the agent to install and configure MDCP from the existing docs.
- Watch the agent set up the pipeline — proving how easy it is to begin the long-term journey of capturing intent.

---

### FAQ: What MDCP is NOT

Before we wrap — the honest objections:

1. **Why not store project plans, tickets, or Cursor plans in the repo?**
2. **Why yet another doc tool? Aren't there a million already?**
3. **How does this integrate with my existing doc tools, and why give it a try?**

---

### Why not store project plans, tickets, or Cursor plans in the repo?

- MDCP holds **hard, durable system context** — intent, architecture, terminology, edge cases, personas.
- Tickets and spikes **do** capture what happened — but future readers need the **outcome**, not the incident log or the path to the answer.
- Distill learnings into shards: new constraints, updated personas, how people use the system, why the system changed.
- The **story** lives in Linear, Jira, and your planning stack. The **durable result** lives in the repo.

---

### Why yet another doc tool?

- We're not replacing Docusaurus, MkDocs, or CI doc generators.
- MDCP is a **protocol** — like OpenAPI for HTTP APIs — for **documentation context contracts**.
- Doc sites and crawled corpora weren't built for granular, PR-reviewable, agent-first retrieval (`refs lookup`, one shard at a time).
- The pain isn't unique. The missing piece is a **shared standard** for validated intent that agents and humans consume the same way.

---

### How does this integrate with my existing doc tools, and why give it a try?

- **Integration, not replacement:** MDCP is designed to work alongside Docusaurus, MkDocs, Confluence exports, and whatever you already publish. Shards are the source of truth; if you still need monolithic files for publishing, `mdcp compile` and `mdcp export` can generate them.
- **Why try it if docs already work?** Docs that work for humans often still fail agents — context dumps, stale pages, and conflicting terms drive up inference cost and hallucinations. MDCP gives agents a **validated, granular contract** (`refs lookup`, one shard at a time) without throwing away your existing toolchain.
- **We need your feedback:** This is early alpha. Try it with your repo, your doc stack, and your agents — then tell us what breaks, what's missing, and what would make it worth adopting.

---

### Call to Action

Let’s ensure the future of agentic coding isn’t just generated faster—it’s designed with intent.

1. **Shape the Standard:** Become a Founding Adopter. Help us build the standard that makes the real work of software engineering sustainable in the AI era.
2. **Kick the tires:** Try the early alpha CLI on NPM:
   `npm install -D @bwilliamson/mdcp-cli`
3. **Show support:** Drop a ⭐ on the GitHub repo if you believe in building quality into our systems.
4. **Spread the word:** Share this with your cross-functional teams to start the conversation about the importance of intent.

---

### Thank You

**Questions?**

- **GitHub:** `betsalel-williamson/mdcp`
- **NPM:** `@bwilliamson/mdcp-cli`
