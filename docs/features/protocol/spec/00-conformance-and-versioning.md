# Conformance and versioning

How to read the obligations in this specification, what it means for a tool or a repository to conform, and how protocol versions are named.

## Conformance keywords

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are used in the RFC 2119 sense. A clause with no keyword is descriptive and carries no obligation.

Where this document states a default, the default is normative: an implementation that omits the field **MUST** behave as if the stated value were present.

## Conformance classes

MDCP has two kinds of conformant thing, and they carry different obligations.

A **conforming implementation** is a tool that reads MDCP inputs and produces MDCP outputs. It **MUST** implement manifest resolution, compile semantics, the refs registry, and the validation pipeline as specified. It **MUST NOT** introduce transforms that change compiled output unless an adopter opted into them through configuration.

A **conforming repository** is a documentation tree that a conforming implementation can compile and validate without error. It **MUST** carry a configuration file that satisfies [Configuration](./03-configuration.md), and each guide it names **MUST** carry a manifest that satisfies [Manifest](./02-manifest.md).

An implementation **MAY** support only a subset — for example a reader that resolves manifests but never compiles. Such a tool is not a conforming implementation and **MUST NOT** describe itself as one.

## Determinism

For a given input tree and configuration, a conforming implementation **MUST** produce byte-identical compiled output and a byte-identical refs registry on every run. Compile order, slug assignment, and source-tag paths are all derived from the input, never from filesystem iteration order or wall-clock time. This is what makes the compiled-output diff check in [Validation pipeline](./07-validation.md) meaningful as a CI gate.

## Protocol version

A configuration **MAY** declare `protocolVersion`. The value is a **four-part** dotted string. An implementation **MUST** expand an abbreviated value by appending `.0` segments until four parts are present, so `1` and `1.0` both expand to `1.0.0.0`. Values longer than four parts are truncated to four.

When the field is absent, an implementation **MUST** apply the default `0.5.0.0`.

A repository conforming to this document **SHOULD** declare `"protocolVersion": "1.0"`.

Protocol version is not package version. The reference implementation's npm packages version independently under semver, and a protocol version maps to a release tag only by its first three parts.

## Open questions before 1.0 final

This document is a draft because the following are unresolved, not because the clauses above are provisional.

- **Normative thresholds are absent.** The specification states no maximum shard size, no maximum manifest depth, and no corpus size at which any rule changes. The maintainer's corpus is roughly 130 shards in one repository with one primary author, which is not evidence for a threshold that other projects would have to obey. Stating one anyway would be guessing. Evidence is being sought from larger corpora before any such limit is written.
- **Reuse across shards** is unspecified beyond `inlineInserts`. Whether "define once, specialize later" belongs in the protocol, in an extension, or nowhere is tracked in [GitHub #232](https://github.com/betsalel-williamson/mdcp/issues/232).
- **Semantic drift** between documentation and system behavior is out of scope here, and this document does not claim to detect it. Structural validation is not a correctness proof.
