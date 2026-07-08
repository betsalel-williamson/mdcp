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

### The Alternate Vision: MDCP

**MarkDown Context Protocol (MDCP)** is an open, repo-local standard for **system context**.

- Like OpenAPI is for HTTP APIs, but for **intent, design, and terminology**.
- **Small shards** are the source of truth.
- Agents pull **one section at a time** via `refs lookup` or single shard reads.

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

### Call to Action

Let’s ensure the future of agentic coding isn’t just generated faster—it’s designed with intent.

1. **Join the Grass-Roots Effort:** If you experience this problem, connect with me to co-develop this protocol for an AI-first approach.
2. **Kick the tires:** Try the early alpha CLI on NPM:
   `npm install -D @bwilliamson/mdcp-cli`
3. **Show support:** Drop a ⭐ on the GitHub repo if you believe in building quality into our systems.
4. **Spread the word:** Share this with your cross-functional teams to start the conversation about the importance of intent.

---

### Thank You

**Questions?**

- **GitHub:** `betsalel-williamson/mdcp`
- **NPM:** `@bwilliamson/mdcp-cli`
