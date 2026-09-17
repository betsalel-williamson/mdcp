# Security and portability

What an implementation is allowed to read, write, and execute.

## No code from configuration

Configuration selects behavior; it never supplies behavior. A conforming implementation **MUST NOT** load or execute code named by `mdcp.config.json` — no plugin paths, no module specifiers, no inline expressions. `compile.hooks` selects among transforms the implementation already carries, and an unknown hook name **MUST** be ignored rather than resolved.

This is the property that lets a repository compile untrusted documentation. A pull request that edits `mdcp.config.json` cannot, by that edit alone, cause code to run.

## Peer execution

The validation pipeline invokes external linters. An implementation **MUST** invoke a peer with a fixed argument list derived from configuration values, and **MUST NOT** pass configuration through a shell. Peers are resolved from the host repository's `node_modules/.bin`, walking upward from the working directory, and then from the executable search path.

An adopter who does not want third-party binaries invoked **MAY** configure none. No peer is required for a conforming repository.

## Path resolution

Every path in configuration is relative to a stated base: the docs root for guide paths and `scopeRoot`, `outputDir` for output and registry paths, the invocation directory for the configuration file and the scan root.

An absolute output path **MUST** be honored unchanged. This is the mechanism by which a guide publishes outside the docs root, and it is intentional: this repository writes `DEVELOPERS.md` and package READMEs that way.

Because absolute and upward paths are permitted for outputs, an adopter **MUST** treat write targets as trusted configuration. An implementation **SHOULD** report every path it writes, so that an unexpected target is visible in the log rather than discovered later.

## Reads during compile

Compile reads shards inside the guide subtree, files inside a configured `scopeRoot`, and — for `codeEvidence` — repository source files that a shard cites by link. An implementation **MUST NOT** fetch over the network during compile. A documentation build that requires the network is not reproducible, and reproducibility is required by [Conformance](./00-conformance-and-versioning.md#determinism).

## Portability

Compiled output **MUST NOT** depend on the host operating system. Source-tag paths are emitted with forward slashes, line endings in output are newline-terminated, and slug assignment depends only on heading text and document order.

An implementation **MUST NOT** depend on filesystem iteration order for anything that reaches compiled output. Where a directory listing is used — the manifest fallback in [Manifest](./02-manifest.md) — the result **MUST** be sorted.
