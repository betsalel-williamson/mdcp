## The Problem: The $2.4T Cost of Software Failures

- **$2.41 trillion** total cost of poor software quality in the US (2022).
- **~$1.8 trillion** of that from operational software failures.
- **$1.52 trillion** in rapidly accumulating technical debt.
- _Source: [Consortium for Information & Software Quality (CISQ) 2022 CPSQ Report](https://www.it-cisq.org/wp-content/uploads/sites/6/2022/11/CPSQ-Report-Nov-22-2.pdf)_

**The Root Cause: "Documentation Debt" & Lost Intent**
As defined by [IBM](https://community.ibm.com/community/user/blogs/frank-de-gilio/2026/05/28/the-repository-knows-why), this happens when requirements fail to match what was actually built. When problems are solved in code but never make it back to the PRD, we lose **traceability**.

---

## The Trillion-Dollar Graveyard

- **Lost Context:** Invisible solutions to unknown problems become load-bearing features.
- **The AI Amplifier ([GitClear 2024/2025](https://gitclear-public.s3.us-west-2.amazonaws.com/GitClear-AI-Copilot-Code-Quality-2025.pdf)):** AI generation increased duplicate code 8x while healthy refactoring dropped below 10%.
- **The Verification Tax ([DORA 2026](https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report/)):** Reviewing AI code is creating massive bottlenecks. Without traceability to original intent, AI just generates legacy technical debt at scale.

---

## Context Overload

- Large documentation dumps (monolithic READMEs, site-wide `llms.txt`) pollute agent reasoning.
- Massive context dumps increase latency, drive up inference costs, and trigger hallucinations from conflicting legacy terms.
- Teams lack a shared, reviewable contract for **what documentation means**.

---

## The Adversarial Reality: Why Docs Always Fail

We have known documentation is the problem for decades, yet we rarely fix it. Why?

- **Working code sells:** Demos and MVPs win deals. Docs and maintenance are usually only valued during failures and disasters.
- **Docs are viewed as a chore:** Engineers who build systems often see documentation as a duplication of work.
- **The "Look at the Code" Fallacy:** Engineers argue, "Want to know what the system does? Look at the code."

**Why "Look at the Code" fails:**

- The business (who manages the system) and the users don't have access to the code.
- When things go wrong, new engineers lack the context to understand _why_ one part links to another.
- Code doesn't explain why tests are stale, or capture the critical edge case that lived in a Jira ticket but never made it back to the codebase.

---
