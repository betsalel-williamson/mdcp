# Compile pipeline

The compile pipeline turns ordered shards into guide outputs. This shard explains **what compile does** for maintainers designing around the capability — one concern: compile behavior and contracts.

## Purpose

Compile walks the configured guide order, loads each shard once, demotes headings, rewrites cross-links, and writes compiled markdown (and optional publish targets). Agents and humans use compile so published docs match shard sources.

## Inputs

- A docs root with guide directories listed in `compileOrder`
- Shard markdown files linked from each guide `index.md`
- Optional compile hooks and output file settings in `mdcp.config.json`

## Outputs

- Compiled guide files under the configured output locations
- Stable heading slugs used by cross-link fragments
- Warnings or errors when links or structure violate check rules (check is separate)

## Non-goals

Compile does not validate prose style (Vale), does not run unit tests, and does not implement product features. It does not decide where a topic belongs across guides — authors do.

## Acceptance signals

- Re-running compile with unchanged shards is idempotent for content
- Fragment links in shards resolve after compile when check passes
- Guide link order in `index.md` controls narrative order in the compiled guide

## Operational notes (still the same concern)

Large guides cost more wall-clock time. Prefer fewer, responsibility-focused shards so agents load one idea at a time — but length alone is not a defect when the audience, job, and concern stay single.

## Glossary touchpoints

Terms such as shard, guide, and refs belong in glossary shards when disambiguation is needed; this file assumes those definitions and does not redefine them.

## Change triggers

Change this shard when compile’s **behavior or contracts** change — not when client tutorials or contributor setup runbooks change.
