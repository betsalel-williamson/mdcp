# Getting started with mdcp (init-first)

Copy into your agent. Set `FEATURE=` and `PERSONA=` if needed.

---

**STEP 0 (required):**

```bash
npx @bwilliamson/mdcp-cli init --docs-root docs
```

If output shows existing docs, **ask the user:** defaults or augment?

**STEP 1:**

```bash
# Path A — standard scaffold
npx @bwilliamson/mdcp-cli init --docs-root docs --mode default --preset code

# Path B — keep existing docs, add MDCP structure
npx @bwilliamson/mdcp-cli init --docs-root docs --mode augment --preset code
```

**STEP 2:** `mdcp compile` and `mdcp check` using this repo's package manager scripts.

Use mdcp commands only. Glossary first under `docs/glossary/`. Do not hand-edit compiled output.
