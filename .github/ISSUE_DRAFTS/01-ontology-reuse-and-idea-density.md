# Issue draft 1 — Ontology / idea density / OOP reuse

Copy into **Feedback or question** (`.github/ISSUE_TEMPLATE/02-feedback.yml`).

## Title

```text
[Feedback] Ontology condensation & idea density: define once without prose inheritance?
```

## Value-add priority (dropdown)

`P1 — high near-term value`

## Suggested labels (after create)

`feedback`, `protocol`, `documentation`, `priority:P1`

## Summary

```markdown
## Question

From a CS / knowledge-modeling lens: how does MDCP _condense_ an ontology of product intent as a project grows? Stakeholders worry that without OOP-style inheritance (“Animal → Dog → Poodle” in docs), **idea density falls over time** and **near-duplicate variants rise** (documentation as a denormalized store).

Concrete worry: a system modeling animals cannot describe qualities once and have other documents inherit those qualities succinctly — so as N → ∞, the corpus grows fluff and drift.

## Position to validate (maintainer intuition)

### Category error (docs ≠ domain model)

Code inheritance answers: _what is this thing, and what properties reuse?_  
Documentation jobs answer: _who needs what, for which action, at what fidelity?_

MDCP captures **context and intent** so humans and agents can reason about how a system should function, audit the **as-built** system against high-level specs, and keep durable information out of chat. That is a separate concern from precise system modeling that **code** (types, schemas, tests) already does well.

Forcing `extends` / prose inheritance into Markdown often produces the opposite pathology: mega-base docs no one can load alone, mixing explain / how-to / reference.

### How MDCP condenses today (not a type system)

- **Shard SRP + idea mitosis** — one settled idea × audience × job; split when a second responsibility appears
- **Glossary** — one term per shard + disambiguation
- **Guides** — ordered constellations; compile for humans/CI
- **Composition** — links, shared insert libraries (`inlineInserts`), pointer shards into source
- **Archetypes / extensions** — layout packs; SOLID applied to protocol layers, not class inheritance of shard bodies
- **Explicit non-goal** — no preprocessor, templating, or parameterized partials in core ([preprocessor-templating](docs/features/design-constraints/preprocessor-templating.md))

Closest OOP analogies: SRP on shards, open/closed via extensions. There is **no** concept-inheritance DSL for documentation ideas — by design.

### Sidestep for product software (density without inheritance)

Describe features at a **high level** (plan, constraints, acceptance). Put hard structure in tables, data, schemas, and code. Refactor information so the doc set is not a denormalized dump of implementation. Tight constraints documented in Markdown should **migrate into tests, harnesses, and QA layers** that enforce them. Flexible systems stay light; rigid / high-rigor systems need more shards and stricter intake — not a second type system in prose.

### Real scaling risk (accept under a better name)

Density collapse is a **governance + information architecture** failure, not the absence of `class Dog extends Animal` in Markdown:

- uncontrolled mitosis / copy-paste variants
- glossary forks instead of disambiguation
- no intake bar: _necessary, unique, serves the purpose_ (Navy technical-manual rigor as existence proof — hierarchies, section flows, templates, oversight)

Large corpora (hundreds → tens of thousands of pages) are in **scope of the content domain** ([scope and positioning](docs/features/protocol/01-scope-and-positioning.md)); dogfood is still early/small. Scaling needs resources and experimentation (archetypes, intake QA, check at large N) — not a mathematical proof that density must fall.

### Positioning vs mature doc orgs

Successful large systems (e.g. GCP-scale client docs) already practice MDCP-like principles: SRP topics, organized guides, accurate information, technical writers + engineers. They are **existence proofs of the practice**, not proof that MDCP is unnecessary for everyone.

MDCP’s niche: teams and personalities that historically **ignored** documentation because it felt tedious — engineers focused on code and efficiency, less on client-side context and the surrounding product ecosystem (“inmates running the asylum”). The Skill + toolchain encode library discipline for that audience.

## Decisions needed

1. Is “define once → specialize at scale” a **protocol concern**, **extension pack**, **adopter playbook** (preprocess outside MDCP), or explicit **non-goal**?
2. Confirm normative wording: OOP desire → MDCP primitives (composition, inserts, pointers, tests) vs reject prose inheritance in core.
3. What belongs in `mdcp check` vs Skill/QA vs human two-level review for uniqueness / anti-duplication?
4. How do rigid / high-detail systems (equipment manuals, hard specs) use the same protocol without stuffing implementation density into shards?

## Related

- #78 Extension taxonomy (`arch-*` / `format-*`)
- #76 Modeling-framework compatibility matrix
- #48 / #44 Protocol formalization
- #157 Skill: doc-sync (inventory / coverage — related to scale, not inheritance)
- #52 Compile-output diff (structural drift)
- Sibling draft: token / cost measurement (file as separate Feedback issue)
- Design constraint: preprocessor-templating (out of scope)

## Acceptance (proposed)

- [ ] Normative or design shard / ADR documenting today’s reuse surface, the category-error position, and chosen target model or non-goals
- [ ] Explicit mapping: OOP inheritance desire → MDCP primitives (or “do this outside MDCP / in code & tests”)
- [ ] Guidance for high-rigor corpora (intake uniqueness, hierarchies) without introducing Handlebars-style macros into core
- [ ] Clarify relationship to #78, #76, and constraint→test migration for hard rules
- [ ] Skill / QA updates only if workflow changes; `pnpm docs:check` green
```

## Additional context

```markdown
Stakeholder hypothesis: without idea inheritance, as projects grow to infinity, idea density decreases and duplication of variations increases.

Maintainer working position (2026-07 exploration): category error between documentation context and OOP domain modeling; density is a governance problem; high-level feature contracts + tables/data + code/tests sidestep prose inheritance; MDCP targets under-documenting engineering cultures; large-scale rigor needs experimentation beyond current dogfood.

File via Feedback template; Track suggestion: **1.0 Formalization**.
```
