# protocol version

Optional four-part string for MDCP **artifact and config compatibility** (historically default `0.4.0.0`). Declared in `mdcp.config.json` as `protocolVersion` when present.

Legacy `mdcp.v*.llms.txt` files used the same string in a first-line header (`mdcp-llms-index: 0.4.0.0`). That bootstrap path is deprecated — prefer [Agent Skills](./agent-skills.md). See [mdcp-llms-index](./mdcp-llms-index.md).

Protocol version is **not** npm semver. npm `@bwilliamson/mdcp-cli` remains pre-1.0 while tooling and agent delivery continue to evolve.
