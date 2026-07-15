# Markdown formatting

## Base Requirement

When contributing documentation, rely on **simple GFM (GitHub Flavored Markdown)** as the standard.

## We do not enforce OKF

We explicitly decided not to adopt OKF (One Knowledge Format) or any other highly opinionated, rigid document structure (see [ADR 0003](../features/adr/0003-do-not-adopt-okf.md)). The goal is to keep the authoring experience simple, flexible, and accessible. You do not need to adhere to complex metadata schemas or strict structural hierarchies when writing documentation shards.

## Strict Link Validity

While we are unopinionated about document structure, we are **strict about links**.

- All links in your documentation must be valid and point to existing files or headings.
- If a link is invalid, the CI and documentation checks will fail.
- Do not create links to files that do not exist yet. If you need to indicate a placeholder, comment it out or write `(TBD)`.

For more details on the link validation rules, please consult the [Format specification](../features/protocol/format-specification.md).
