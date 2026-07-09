<style scoped>
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: center;
}
.columns img {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;
}
</style>

<div class="columns">
<div>

## The 30,000-Foot View: MDCP in the Value Stream

Where does MDCP sit in the software development value stream? It forms a persistent, machine-readable **Context Layer**.

The actors interact with the MDCP context layer to author intent, provide context, and generate evidence.

</div>
<div>

![MDCP Value Stream](./assets/mdcp-actors-and-artifacts.png)

</div>
</div>

---

<style scoped>
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: center;
}
.columns img {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;
}
</style>

<div class="columns">
<div>

### MDCP Across the SDLC

While the previous diagram highlights _who_ interacts with MDCP, this view shows _where_ it sits in the traditional SDLC.

Instead of documentation being a disconnected artifact, MDCP acts as a continuous, bidirectional context layer.

</div>
<div>

![MDCP SDLC](./assets/mdcp-sdlc-prompts.png)

</div>
</div>

---

## What MDCP Is and Isn't

To understand where to pull MDCP in, we must be clear on its boundaries.

### What MDCP Replaces

- Fragmented, quickly-outdated Wiki pages.
- Stale `README.md` files that no one trusts.
- Scattered Architecture Decision Records (ADRs).
- Undocumented "tribal knowledge."

### What MDCP Isn't

- **Not a Jira alternative:** It doesn't track task states or agile sprints.
- **Not active system monitoring:** It doesn't tell you if the server is down.
- **Not a rigid documentation silo:** It lives _in_ the repository alongside the code.

---

## Compliance & Auditing Synergies

MDCP turns documentation into an auditable artifact that evolves with the system.

- **SOC 2 Support:** Acts as a version-controlled source of truth for change management and system descriptions.
- **ISO Standards:** Supports **ISO 9001** (Quality Management Systems) document control and **ISO/IEC 27001** (Information Security Management) traceability requirements.
- **Future Vision: SOC2 Doc Extension:** An extension that automatically generates compliance checklists from your system shards, immediately flagging if a required policy is missing.

---

## Beyond Software: The Agentic Era

MDCP's structure has powerful applications far beyond traditional software engineering.

In the **Agentic Era**, AI agents will need context to interact with physical world processes and legacy systems. MDCP can act as the structured context for:

- **Work Instructions:** Freeing manufacturing or procedural instructions from proprietary, locked-down systems.
- **Hardware Manufacturing & Supply Chain:** Agents can parse MDCP shards to understand operational sequences and interface with legacy ERP tools.
- **Legal & Operations:** Providing explicit, version-controlled business logic that agents can reliably execute.

---
