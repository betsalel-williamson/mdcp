# Repository layout

```text
mdcp/
├── CODE_OF_CONDUCT.md      # Contributor Covenant (committed)
├── README.md               # Compiled from docs/repo-readme/ (committed)
├── DEVELOPERS.md           # Compiled from docs/developer/ (committed)
├── packages/
│   ├── mdcp-core/          # @bwilliamson/mdcp-core — compile, refs, validation library
│   ├── mdcp-cli/           # @bwilliamson/mdcp-cli — `mdcp` CLI binary
│   └── mdcp-presets/       # @bwilliamson/mdcp-presets — markdownlint starter configs
├── docs/                   # Sharded docs (mdcp.config.json) — dogfood target
│   ├── glossary/           # Shared acronyms and terms (cross-guide, like insert libraries)
│   ├── features/           # Tool capabilities → docs/_build/guides.md (local review, gitignored)
│   ├── developer/          # This guide → DEVELOPERS.md
│   ├── client-cli/         # → packages/mdcp-cli/README.md
│   ├── client-core/        # → packages/mdcp-core/README.md
│   └── repo-readme/        # → README.md (publish landing)
├── examples/sample-guides/ # Minimal consumer fixture for tests and tutorials
├── legacy/                 # Original bash/Python reference implementation
├── .changeset/             # Changesets for semver releases
└── .github/workflows/      # CI and release automation
```

## Published packages

All three npm packages share one version (fixed versioning via Changesets). Each ships `dist/` and a generated or hand-authored `README.md` in its tarball.

`mdcp-presets` README is hand-authored for now. Root `README.md`, CLI, and core READMEs are **compiled** from `docs/repo-readme/`, `docs/client-cli/`, and `docs/client-core/` shards.
