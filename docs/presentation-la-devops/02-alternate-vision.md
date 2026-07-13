## The Alternate Vision: MDCP

**MarkDown Context Protocol (MDCP)** is an open, repo-local standard for **system context**.

- It is **not just a repository**; it is a **protocol and method** that assists with the proper practice of developing docs.
- Through protocol shards and prompt examples, we ensure we capture docs and details to the proper degree to support all activities across the value chain.
- **Small shards** are the source of truth.
- Agents pull **one section at a time** via `refs lookup` or single shard reads.
- **The Relief:** Write your documentation _once_. It serves as an onboarding guide for humans and a machine-readable context protocol for AI. No more explaining your architecture to every new agent.

---

## Why Will MDCP Actually Work?

If we just demand more docs, aren't we just shifting the burden to a new generation? Why does _this_ tool make a dent in the code quality problem?

At the end of the day, MDCP is a tool, and it requires someone to use it productively. But the vision is that MDCP enables people to **think more clearly**. It flips the script so that the people making systems see documentation—especially in this new age—as the _fun part_ of the design process, not a post-hoc chore.

In the age of LLM-generated code, our greatest risk is creating systems "too complicated" for us to understand.

### The RISC vs CISC Argument for Codebases

- **CISC (Complex Instruction Set):** Monolithic, tangled logic where you must understand the whole to understand the parts.
- **RISC (Reduced Instruction Set):** MDCP takes the RISC approach. We break down the system into small, digestible, composable components (shards).

Because each individual part can be understood, the rest of the system can be reasoned about. We believe that anyone with time and smarts can sit down, read the docs, and reason through the code and the architectural choices made by the LLM or the human.

_Note: MDCP is currently in single-person development. As this scales to multiple contributors, we expect new collaborative patterns to emerge, but the foundation of composable understanding remains._

---

## Cross-Functional Collaboration

To survive the AI era, we must bring everyone to the front of the line:

- Product Managers (defining the "why")
- FinOps
- Technical Writers (wrangling the "how")
- System Architects
- QA Engineers & Support Staff

**MDCP restores a healthy, collaborative engineering culture.**

---
