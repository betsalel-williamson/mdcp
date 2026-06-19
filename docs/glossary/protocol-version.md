# protocol version

Four-part version for MDCP **artifact and config compatibility** (default `0.4.0.0`). Declared in `mdcp.config.json` as `protocolVersion` and in `mdcp.v*.llms.txt` as the first-line header `mdcp-llms-index: 0.4.0.0`. Filename may abbreviate trailing `.0` segments (`mdcp.v0.4.llms.txt` ≡ `0.4.0.0`).

**Version history:** `0.4.0.0` is the first published llms-index spec (open alpha). Pre-0.4 compile and doc-authoring evolution is recorded in [package changelogs](https://github.com/betsalel-williamson/mdcp/blob/main/packages/mdcp-cli/CHANGELOG.md) and the [0.4.0 changesets](https://github.com/betsalel-williamson/mdcp/tree/main/.changeset/) — see [Versioning and releases](../developer/versioning-and-releases.md#040-open-alpha-milestone).

Protocol version is **not** npm semver. npm `@bwilliamson/mdcp-cli@0.4.1` implements this draft protocol profile while tooling remains pre-1.0. **`valpha`** is the open-alpha symlink; **`vstable`** is reserved for npm **1.0.0**.
