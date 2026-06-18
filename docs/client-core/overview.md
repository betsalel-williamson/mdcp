# Overview

Core library for **mdcp** — compile sharded Markdown guides, build section link registries, validate structure, and export LLM-friendly output.

Use this package when you need mdcp behavior in scripts, CI pipelines, editors, or other tools without shelling out to the CLI.

## Requirements

- Node.js **>= 22.12.0**

## Install

```bash
npm install @bwilliamson/mdcp-core
```

The CLI (`@bwilliamson/mdcp-cli`) depends on this package. Install `@bwilliamson/mdcp-core` directly only when you need the programmatic API.

## Stability

**Pre-1.0 / open alpha (0.4.0):** There is **no API stability guarantee** until **1.0.0**. Exported functions, types, `mdcp.config.json` schema, and compile output may change in any `0.x.y` release. Pin `@bwilliamson/mdcp-core@0.4.0` and read package changelogs before upgrading.
