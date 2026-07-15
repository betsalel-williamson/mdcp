# protocol version

Optional four-part string for MDCP **artifact and config compatibility** (historically default `0.4.0.0`). Declared in `mdcp.config.json` as `protocolVersion` when present.

Prefer [Agent Skills](./agent-skills.md) for agent delivery. The deprecated [mdcp-llms-index](./mdcp-llms-index.md) export profile is separate from this config field.

Protocol version is **not** npm semver. npm `@bwilliamson/mdcp-cli` remains pre-1.0 while tooling and agent delivery continue to evolve.
