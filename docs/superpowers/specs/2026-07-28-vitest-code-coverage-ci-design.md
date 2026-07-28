# Vitest code coverage + CI summary/artifacts

**Date:** 2026-07-28  
**Status:** Approved for planning  
**Issue:** [#203](https://github.com/betsalel-williamson/mdcp/issues/203)

## Problem

`mdcp-core` and `mdcp-cli` run Vitest with no coverage provider. Contributors cannot see line/branch coverage locally, and CI has no durable report. Documentation “coverage” in this repo means the markdown capture scan — not test code coverage.

## Goals

1. Collect coverage for `mdcp-core` and `mdcp-cli` via `@vitest/coverage-v8`.
2. Keep default `pnpm test` and `pnpm check` fast and unchanged.
3. On CI, upload HTML/lcov (and json-summary) as artifacts and print package totals in the GitHub Actions job summary.
4. Document the maintainer workflow under `docs/developer/`.

## Non-goals

- Coverage thresholds or failing CI on a percentage floor.
- Codecov, Coveralls, Gaffer, or other external coverage hosts.
- Pull-request comments (would need `pull-requests: write`).
- Covering root `scripts/**/*.test.mjs` (`node --test`).
- Folding coverage into the primary `check` job or `pnpm check`.

## Approach

**Separate CI `coverage` job (Approach 1)** alongside existing `check` / `changeset`.

### Tooling

| Piece | Choice |
| --- | --- |
| Provider | `@vitest/coverage-v8` (devDependency on both packages) |
| Packages | `packages/mdcp-core`, `packages/mdcp-cli` only |
| Reporters | `text`, `json-summary`, `html`, `lcov` |
| Local command | `pnpm test:coverage` at root → both packages; package-level scripts match |
| Default tests | `pnpm test` / package `vitest run` unchanged (no coverage) |

Per-package `vitest.config.ts` gains a `coverage` block (include `src/**`, exclude tests/`dist` as needed). Output under each package’s `coverage/` directory (`coverage/` already gitignored).

### CI job

New job on the same triggers as `check` (`push` to `main`, all `pull_request`s):

1. Harden-runner + checkout + pnpm + Node 24 (same pins/patterns as `check`).
2. `pnpm install --frozen-lockfile` → `pnpm run build` → `pnpm run test:coverage`.
3. **Job summary:** a small shell/`jq` step appends a markdown table to `$GITHUB_STEP_SUMMARY` with statements / branches / functions / lines % for each package, reading `packages/*/coverage/coverage-summary.json`. No third-party report action in v1.
4. **Artifacts:** `actions/upload-artifact` for each package’s `coverage/` (or one combined artifact with both trees). Retention: GitHub default is fine.

Permissions: `contents: read` only. Pin any actions to full commit SHAs with tag comments (repo convention).

### Docs

Update `docs/developer/packages-and-tests.md` (and `docs/developer/index.md` only if a new shard is added — prefer extending the existing shard). Describe:

- `pnpm test:coverage` for local HTML/text reports
- That CI publishes a job summary + downloadable artifacts
- That this is **test** coverage, distinct from the documentation coverage scan

No `docs/features/` or `docs/client/` shards (maintainer-only).

### Changeset

DevDependency / CI / docs only — **no changeset** unless a published package’s runtime surface changes (it should not).

## Job summary contract

For each of `mdcp-core` and `mdcp-cli`, the summary includes at least:

| Metric | Source |
| --- | --- |
| Statements % | `total.statements.pct` |
| Branches % | `total.branches.pct` |
| Functions % | `total.functions.pct` |
| Lines % | `total.lines.pct` |

File-level uncovered lines stay in the HTML artifact for v1. A marketplace action (e.g. `davelosert/vitest-coverage-report-action` with `comment-on: none`) is an explicit follow-up if richer in-summary file tables are needed.

## Success criteria

- Local `pnpm test:coverage` produces text + HTML under each package’s `coverage/`.
- CI `coverage` job is green on PRs; summary shows both packages; artifacts downloadable.
- `pnpm test` and `pnpm check` behavior and runtime profile unchanged aside from lockfile/devDeps.
- Developer docs mention the new script and CI outputs.
- #203 closable when the above land.

## Follow-ups (out of this issue)

- Optional: marketplace Vitest coverage summary action (pinned SHA), still without PR comments.
- Optional: thresholds once a baseline is known.
- Optional: coverage for root `scripts/` tests.
