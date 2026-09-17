# Validation pipeline

The ordered obligations of the check gate, and which failures stop it.

## Two kinds of failure

A **fatal** step ends validation immediately; later steps do not run. A **collected** step records a failure and lets validation continue, so that one run reports every problem it can see.

The distinction is not cosmetic. Orphan and registry failures are fatal because every later step reads compiled output, and compiled output derived from a broken manifest would produce misleading diagnostics.

## Order

A conforming implementation **MUST** run the steps in this order.

| Step | Obligation                         | On failure                                   |
| ---- | ---------------------------------- | -------------------------------------------- |
| 1    | Orphan check                       | Fatal                                        |
| 2    | Compile and write outputs          | Fatal on any compile error                   |
| 3    | Generate and verify refs registry  | Fatal                                        |
| 4    | Built-in link validation           | Collected, at the configured severity        |
| 5    | Markdown lint over shards          | Collected, when configured                   |
| 6    | Markdown lint over compiled output | Collected, when configured                   |
| 7    | External link check                | Collected, when the peer and config exist    |
| 8    | Prose lint                         | Collected, unless skipped                    |
| 9    | Coverage scan                      | Fatal when `scan.strict`, otherwise reported |

Validation succeeds only when no fatal step failed and no collected failure was recorded.

## Orphan check

An implementation **MUST** report, for each guide: a missing guide directory; a manifest that cannot be read; a manifest entry naming a file that does not exist; and a Markdown file present in the guide directory that no manifest entry names.

The orphan check reads manifests **without** transitive expansion and inspects only the top level of each guide directory. Files in subdirectories are therefore not orphan-checked even though compile includes them. This is a gap between the two readers, not a rule; it is recorded on [GitHub #48](https://github.com/betsalel-williamson/mdcp/issues/48).

The manifest file itself and `shards.md` are never orphans.

## Compile and write

Validation compiles the tree and writes outputs, rather than compiling in memory. This is what lets continuous integration detect stale compiled files with a version-control diff after the gate runs: a repository whose committed outputs match its shards produces no diff.

## Refs registry

An implementation **MUST** generate the registry from the freshly compiled text and then verify it, as specified in [Refs registry](./06-refs-registry.md).

## Built-in link validation

An implementation **MUST** resolve internal Markdown links and report three failure reasons distinctly: a dead anchor, a missing file, and a missing publish path. External `http` and `https` targets are out of scope for this step.

Severity comes from `lint.links.severity` and defaults to `error`. At `warn`, issues are reported without failing the gate.

Publish outputs are held to a stricter rule: a link in publish output **MUST** target a published document rather than a guide shard source, because a reader of the published file cannot follow a path into the shard tree.

## Peer linters

Steps 5 through 8 delegate to external tools. An implementation **MUST** skip a peer that is not installed, and **MUST** fail instead of skipping when the operator required that peer explicitly. Peers are resolved from the host repository's local binaries first, then from the executable search path.

Peer tools are not part of this specification. An adopter **MAY** run none of them and still have a conforming repository; what they check — Markdown style, prose style, external URL liveness — is deliberately outside the protocol. The boundary is argued in [Locale and language](../../design-constraints/locale-and-language.md).

## Coverage scan

The coverage scan reports Markdown files under the scan root that no guide accounts for, and registered standalone entries whose files are missing. It is reported but non-fatal unless `scan.strict` is true.

A file is accounted for when it lives under a registered guide directory or a guide's `scopeRoot`, when it is a compile output, or when it is registered in `standaloneGuides`. Everything else is a gap: either the file belongs in a guide, or the repository should say out loud that it stands alone.
