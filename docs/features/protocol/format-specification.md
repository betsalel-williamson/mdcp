# Format specification

## What this is

This document outlines the base formatting requirements and structural guidelines for our documentation. It establishes the baseline for authoring, parsing, and validating our shards.

## What this isn't

This is not a rigid or highly opinionated knowledge schema. We actively avoid overly prescriptive formats to keep the authoring experience simple and accessible. We do not enforce strict document hierarchies or complex metadata requirements for standard documentation.

## Base Requirement: Simple GFM

Our foundational format is **simple GFM (GitHub Flavored Markdown)**.

- We rely on standard markdown elements (headings, lists, links, code blocks) to structure information.
- GFM provides a universally understood baseline that works seamlessly across various editors, repositories, and presentation layers.
- By adhering to simple GFM, we ensure our systems can parse and compile the documentation without relying on bespoke syntax or rigid external specifications.

## Other Features

While simple GFM is our base, our documentation ecosystem includes specific features to enhance developer experience and agent capabilities, such as:

- Manifest compile ordering.
- Link validation.
- Agent Skill delivery.

These features build upon the GFM base but do not fundamentally alter the underlying markdown format.

## Strict Link Validity

We enforce a **Strict Link Validity** requirement across all documentation:

- **All links must be valid.** There are no exceptions for placeholders disguised as active links.
- **Invalid links are broken and should be removed.** If a referenced file or section no longer exists, the link must be deleted or corrected.
- **Indicating future content:** To indicate a link that doesn't yet exist (e.g., a planned document), use alternatives such as commenting it out `<!-- [Planned Feature](./planned-feature.md) -->` or placing a TBD notice (e.g., `Planned Feature (TBD)`).

### Rationale

Docs should be accurate and current. Invalid information inserts drift and significantly increases the chance for AI agent hallucinations. When an agent (or a human) follows a broken link, it breaks context and trust in the documentation ecosystem. Enforcing strict link validity ensures the compiled output is a reliable source of truth.

---

_Note: GitHub and GitHub Flavored Markdown are trademarks of GitHub, Inc. This project is not affiliated with, sponsored by, or endorsed by GitHub, Inc._
