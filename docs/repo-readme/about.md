# Why use MDCP?

- **Docs-as-code discipline for Agents:** Forces agents to plan in Markdown shards rather than hallucinating in the chat window.
- **Smaller context, better accuracy:** Agents use `mdcp refs lookup` to fetch exactly the context they need, rather than digesting thousands of lines of irrelevant documentation.
- **Validation gate:** `mdcp check` runs in CI to guarantee that references and links between shards are valid.
- **Portable:** Works natively in Cursor, GitHub Copilot, Claude Code, and other agent hosts that support the Agent Skills standard.
