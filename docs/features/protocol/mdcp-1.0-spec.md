# MDCP 1.0 specification (draft)

Normative specification for the MarkDown Context Protocol. Parent: [GitHub #48](https://github.com/betsalel-williamson/mdcp/issues/48).

> **Status:** Draft — the reference implementation leads. Every clause below was reconciled against `@bwilliamson/mdcp-core` before publication, but the document is not final until the open questions in [Conformance and versioning](./spec/00-conformance-and-versioning.md#open-questions-before-10-final) are closed. Protocol versioning is independent of package semver.

## What this specification covers

MDCP defines **offline document context preparation**: how shards are laid out, how a manifest orders them, how a compiler assembles them into rendered documents, and how a validator decides whether a documentation tree is well formed. A third party implementing this document should produce byte-identical output to the reference implementation for the same inputs.

MDCP does **not** define wire transport, a runtime host protocol, or a delivery API. That boundary is deliberate and is argued in [Scope and positioning](./01-scope-and-positioning.md).

## How to read the parts

Each part below is normative unless it says otherwise.

- [Conformance and versioning](./spec/00-conformance-and-versioning.md) — conformance keywords, conformance classes, and `protocolVersion`.
- [Repository layout](./spec/01-repository-layout.md) — docs root, guides, shards, and the code repository archetype.
- [Manifest](./spec/02-manifest.md) — manifest discovery, compile order, and transitive inclusion.
- [Configuration](./spec/03-configuration.md) — `mdcp.config.json` fields, defaults, and required values.
- [Compile semantics](./spec/04-compile.md) — heading demotion, preamble, titles, source tags, and outputs.
- [Compile hooks](./spec/05-hooks.md) — the built-in transform set and opt-out rules.
- [Refs registry](./spec/06-refs-registry.md) — slug algorithm, registry shape, and staleness.
- [Validation pipeline](./spec/07-validation.md) — ordered obligations and which failures are fatal.
- [Security and portability](./spec/08-security-and-portability.md) — path resolution, peer execution, and extension boundaries.
- [Worked example](./spec/09-worked-example.md) — `examples/sample-guides/` annotated against the clauses.

## Authoring profile

The parts above specify artifacts and transforms. Two further obligations apply to repositories that adopt the MDCP authoring workflow rather than only its file formats.

Helper skills are part of the MDCP 1.0 authoring profile. Activate one through its skill trigger, for example `/mdcp-feature-level`. A helper skill **MUST** collect `WORK_ITEM` and `WORK_ITEM_LOOKUP` through interactive intake before it edits any shard. Feature work **SHOULD** use [mdcp-feature-level](../../../skills/mdcp-feature-level/SKILL.md). The catalog is in [Agent helper skills](./agent-task-prompts.md).

The Agent Skills pack installed in a consumer docs root **MUST NOT** be hand-edited by agents to carry repository-specific content. Project overlays belong in `docs/extensions/` or in normative shards of the adopting repository. See [Extensions and archetypes](./extensions-and-archetypes.md).

## Agent context delivery

Agent context comes from the parent Agent Skill and from one-shard reads. MDCP 1.0 defines no token-stripping export profile; the removal is recorded in [ADR 0001](../adr/0001-remove-export-profiles.md).

## Appendix A (informative)

MDCP is not MCP, and this specification makes no claim of equivalence with it. The comparison and the delivery-adapter discussion live in [Scope and positioning](./01-scope-and-positioning.md).
