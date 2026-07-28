# Vitest Code Coverage + CI Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vitest `@vitest/coverage-v8` for `mdcp-core` and `mdcp-cli`, a root `pnpm test:coverage` script, and a separate CI `coverage` job that writes package totals to `$GITHUB_STEP_SUMMARY` and uploads HTML/lcov artifacts — without changing default `pnpm test` / `pnpm check`.

**Architecture:** Per-package Vitest coverage config writes `coverage/` locally. A small Node script formats `coverage-summary.json` into markdown for the Actions job summary. CI runs coverage in a job parallel to `check`, with `contents: read` only.

**Tech Stack:** Vitest 4, `@vitest/coverage-v8`, pnpm workspaces, GitHub Actions (`actions/upload-artifact@v7.0.1`), Node `node:test` for the summary helper.

**Worktree:** `/Users/saul/Repos/mdcp/.worktrees/issue-203` on branch `chore/vitest-code-coverage` (from `origin/main`). Issue [#203](https://github.com/betsalel-williamson/mdcp/issues/203).

**Spec:** `docs/superpowers/specs/2026-07-28-vitest-code-coverage-ci-design.md`

## Global Constraints

- Packages covered: `mdcp-core` and `mdcp-cli` only (not root `scripts/**/*.test.mjs`).
- Keep `pnpm test` and package `"test": "vitest run"` unchanged (no coverage by default).
- No coverage thresholds; no Codecov/Coveralls; no PR comments; no `pull-requests: write`.
- Do not fold coverage into the `check` job or `pnpm check`.
- CI job permissions: `contents: read` only; pin third-party actions to full commit SHAs with tag comments.
- `actions/upload-artifact` pin: `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` (# v7.0.1).
- Coverage reporters: `text`, `json-summary`, `html`, `lcov`.
- Provider: `@vitest/coverage-v8` aligned to the same Vitest major/minor as each package (`^4.1.8` range; lockfile resolves).
- No changeset (devDependency / CI / docs only).
- Maintainer docs only under `docs/developer/` — no `docs/features/` or `docs/client/` shards for this.
- Add `docs/superpowers/**` to `docs/mdcp.config.json` `scan.ignore` so specs/plans do not fail `scan.strict`.
- Distinguish **test** coverage from the documentation coverage scan in developer docs.
- After editing developer shards, run `pnpm docs:compile:repo` and commit regenerated `DEVELOPERS.md` when it changes.
- Conventional commits; one concern per commit group as listed in each task.

## File structure

| File | Responsibility |
| --- | --- |
| `packages/mdcp-core/vitest.config.ts` | Coverage block for core |
| `packages/mdcp-cli/vitest.config.ts` | Coverage block for cli |
| `packages/mdcp-*/package.json` | `test:coverage` script + `@vitest/coverage-v8` devDep |
| `package.json` (root) | `test:coverage` script |
| `pnpm-lock.yaml` | Lockfile for coverage-v8 |
| `scripts/coverage-job-summary.mjs` | Read json-summary files → markdown table |
| `scripts/coverage-job-summary.test.mjs` | Unit tests for the summary formatter |
| `.github/workflows/ci.yml` | New `coverage` job |
| `docs/developer/packages-and-tests.md` | Document test coverage workflow |
| `docs/developer/local-setup.md` | Add `pnpm test:coverage` to daily commands |
| `docs/mdcp.config.json` | Ignore `docs/superpowers/**` in coverage scan |
| `DEVELOPERS.md` | Regenerated compile output |

---

### Task 1: Docs first — developer shards + scan ignore

**Files:**
- Modify: `docs/developer/packages-and-tests.md`
- Modify: `docs/developer/local-setup.md`
- Modify: `docs/mdcp.config.json` (`scan.ignore`)
- Modify: `DEVELOPERS.md` (via compile)

**Interfaces:**
- Consumes: none
- Produces: durable maintainer guidance for later tasks; `docs/superpowers/**` ignored by markdown coverage scan

- [ ] **Step 1: Update `packages-and-tests.md`**

Add a section after the mdcp-cli section (before mdcp-presets) titled `## Test code coverage` with intent-only content:

```markdown
## Test code coverage

Vitest coverage for `@bwilliamson/mdcp-core` and `@bwilliamson/mdcp-cli` (not root `scripts/` tests). This is **test** coverage of TypeScript sources — distinct from the [documentation coverage scan](../features/coverage-scan.md).

```bash
pnpm test:coverage
```

Local runs print a text summary and write HTML/lcov under each package’s `coverage/` directory (gitignored). CI runs the same command in a separate **coverage** job, appends package totals to the Actions job summary, and uploads those `coverage/` trees as artifacts. Default `pnpm test` / `pnpm check` do not collect coverage and do not enforce percentage thresholds.
```

Also mention in the “CI runs…” bullet list that a separate **coverage** job uploads artifacts / job summary (informational).

- [ ] **Step 2: Update `local-setup.md` daily commands table**

Add a row after `pnpm test`:

```markdown
| `pnpm test:coverage`     | Vitest coverage for `mdcp-core` and `mdcp-cli` (HTML under `packages/*/coverage/`)              |
```

- [ ] **Step 3: Ignore superpowers specs/plans in markdown coverage scan**

In `docs/mdcp.config.json`, add `"docs/superpowers/**"` to `scan.ignore` (alphabetically near other `docs`-adjacent ignores is fine — place after `"legacy/**"` or with the tooling ignores).

- [ ] **Step 4: Compile and check docs**

Run from worktree root (build CLI first if `dist/` missing):

```bash
pnpm install
pnpm build
pnpm docs:compile:repo
pnpm docs:check:repo
```

Expected: pass; `DEVELOPERS.md` may change.

- [ ] **Step 5: Commit**

```bash
git add docs/developer/packages-and-tests.md docs/developer/local-setup.md docs/mdcp.config.json DEVELOPERS.md
git commit -m "$(cat <<'EOF'
docs: document Vitest coverage and ignore superpowers specs

EOF
)"
```

---

### Task 2: Wire Vitest coverage provider, configs, and scripts

**Files:**
- Modify: `packages/mdcp-core/vitest.config.ts`
- Modify: `packages/mdcp-cli/vitest.config.ts`
- Modify: `packages/mdcp-core/package.json`
- Modify: `packages/mdcp-cli/package.json`
- Modify: `package.json` (root)
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Task 1 docs (commands named `test:coverage`)
- Produces: `pnpm test:coverage` writes `packages/mdcp-core/coverage/coverage-summary.json` and `packages/mdcp-cli/coverage/coverage-summary.json` (plus html/lcov/text)

- [ ] **Step 1: Add package scripts and coverage config**

Set each package’s `vitest.config.ts` to:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,js}'],
      exclude: ['**/*.d.ts', '**/dist/**'],
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
    },
  },
});
```

In each package `package.json` scripts:

```json
"test": "vitest run",
"test:coverage": "vitest run --coverage"
```

Add `"@vitest/coverage-v8": "^4.1.8"` to each package’s `devDependencies` (same caret floor as `vitest`).

Root `package.json` scripts — add after `"test"`:

```json
"test:coverage": "pnpm --filter @bwilliamson/mdcp-core run test:coverage && pnpm --filter @bwilliamson/mdcp-cli run test:coverage"
```

Do **not** change the existing `"test"` script.

- [ ] **Step 2: Install lockfile**

```bash
pnpm install
```

Expected: lockfile updates; no errors.

- [ ] **Step 3: Verify coverage run**

```bash
pnpm build
pnpm test:coverage
```

Expected: both packages finish; files exist:

- `packages/mdcp-core/coverage/coverage-summary.json`
- `packages/mdcp-core/coverage/lcov.info`
- `packages/mdcp-core/coverage/index.html`
- `packages/mdcp-cli/coverage/coverage-summary.json`
- `packages/mdcp-cli/coverage/lcov.info`
- `packages/mdcp-cli/coverage/index.html`

Confirm `pnpm test` still works without requiring the coverage provider to instrument by default:

```bash
pnpm test
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add packages/mdcp-core/vitest.config.ts packages/mdcp-cli/vitest.config.ts packages/mdcp-core/package.json packages/mdcp-cli/package.json package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
chore: add Vitest coverage-v8 for core and cli packages

EOF
)"
```

---

### Task 3: Coverage job-summary script (TDD)

**Files:**
- Create: `scripts/coverage-job-summary.mjs`
- Create: `scripts/coverage-job-summary.test.mjs`

**Interfaces:**
- Consumes: paths to `coverage-summary.json` files shaped like Vitest/istanbul json-summary (`{ total: { statements, branches, functions, lines: { pct: number } } }`)
- Produces: markdown string with an H2 heading and a table; CLI writes to stdout (CI redirects/appends to `$GITHUB_STEP_SUMMARY`)

- [ ] **Step 1: Write the failing test**

Create `scripts/coverage-job-summary.test.mjs`:

```js
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it, after } from 'node:test';
import { formatCoverageJobSummary } from './coverage-job-summary.mjs';

describe('formatCoverageJobSummary', () => {
  it('renders a markdown table for each package summary', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'cov-sum-'));
    after(async () => {
      await rm(root, { recursive: true, force: true });
    });

    const coreDir = path.join(root, 'core');
    const cliDir = path.join(root, 'cli');
    await mkdir(coreDir);
    await mkdir(cliDir);

    await writeFile(
      path.join(coreDir, 'coverage-summary.json'),
      JSON.stringify({
        total: {
          statements: { pct: 80.1 },
          branches: { pct: 70 },
          functions: { pct: 90.25 },
          lines: { pct: 81 },
        },
      }),
    );
    await writeFile(
      path.join(cliDir, 'coverage-summary.json'),
      JSON.stringify({
        total: {
          statements: { pct: 60 },
          branches: { pct: 50.5 },
          functions: { pct: 55 },
          lines: { pct: 61.1 },
        },
      }),
    );

    const md = await formatCoverageJobSummary([
      { name: 'mdcp-core', summaryPath: path.join(coreDir, 'coverage-summary.json') },
      { name: 'mdcp-cli', summaryPath: path.join(cliDir, 'coverage-summary.json') },
    ]);

    assert.match(md, /## Test coverage/);
    assert.match(md, /\| Package \| Statements \| Branches \| Functions \| Lines \|/);
    assert.match(md, /\| mdcp-core \| 80\.1% \| 70% \| 90\.25% \| 81% \|/);
    assert.match(md, /\| mdcp-cli \| 60% \| 50\.5% \| 55% \| 61\.1% \|/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node --test scripts/coverage-job-summary.test.mjs
```

Expected: FAIL (module not found / export missing).

- [ ] **Step 3: Implement `scripts/coverage-job-summary.mjs`**

```js
#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

/**
 * @typedef {{ name: string, summaryPath: string }} CoveragePackage
 */

/**
 * @param {CoveragePackage[]} packages
 * @returns {Promise<string>}
 */
export async function formatCoverageJobSummary(packages) {
  const rows = [];
  for (const pkg of packages) {
    const raw = await readFile(pkg.summaryPath, 'utf8');
    const data = JSON.parse(raw);
    const t = data.total;
    rows.push(
      `| ${pkg.name} | ${fmtPct(t.statements.pct)} | ${fmtPct(t.branches.pct)} | ${fmtPct(t.functions.pct)} | ${fmtPct(t.lines.pct)} |`,
    );
  }

  return [
    '## Test coverage',
    '',
    '| Package | Statements | Branches | Functions | Lines |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}

function fmtPct(n) {
  return `${n}%`;
}

const isDirectRun =
  process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const defaults = [
    {
      name: 'mdcp-core',
      summaryPath: 'packages/mdcp-core/coverage/coverage-summary.json',
    },
    {
      name: 'mdcp-cli',
      summaryPath: 'packages/mdcp-cli/coverage/coverage-summary.json',
    },
  ];
  formatCoverageJobSummary(defaults).then((md) => {
    process.stdout.write(md);
  });
}
```

Do not pull in extra deps. When imported by tests, `isDirectRun` is false so the CLI does not write to stdout.

- [ ] **Step 4: Run test to verify it passes**

```bash
node --test scripts/coverage-job-summary.test.mjs
```

Expected: PASS.

Also smoke the CLI after a coverage run exists (from Task 2):

```bash
node scripts/coverage-job-summary.mjs | head
```

Expected: markdown table with real percentages.

- [ ] **Step 5: Commit**

```bash
git add scripts/coverage-job-summary.mjs scripts/coverage-job-summary.test.mjs
git commit -m "$(cat <<'EOF'
feat: add coverage job-summary markdown helper

EOF
)"
```

---

### Task 4: CI `coverage` job

**Files:**
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `pnpm test:coverage` (Task 2), `node scripts/coverage-job-summary.mjs` (Task 3)
- Produces: GitHub Actions job summary + uploaded artifacts `coverage-mdcp-core` and `coverage-mdcp-cli`

- [ ] **Step 1: Add the `coverage` job to `ci.yml`**

After the `check` job (before `changeset`), insert:

```yml
  coverage:
    name: Coverage
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      # Harden-Runner: audit mode only — logs egress; block mode is follow-up (#179).
      - uses: step-security/harden-runner@bf7454d06d71f1098171f2acdf0cd4708d7b5920 # v2.20.0
        with:
          egress-policy: audit

      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
        with:
          persist-credentials: false

      - uses: pnpm/action-setup@0ebf47130e4866e96fce0953f49152a61190b271 # v6

      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7
        with:
          node-version: 24
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - run: pnpm run test:coverage

      - name: Write coverage job summary
        if: always()
        run: node scripts/coverage-job-summary.mjs >> "$GITHUB_STEP_SUMMARY"

      - name: Upload mdcp-core coverage
        if: always()
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: coverage-mdcp-core
          path: packages/mdcp-core/coverage
          if-no-files-found: warn

      - name: Upload mdcp-cli coverage
        if: always()
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: coverage-mdcp-cli
          path: packages/mdcp-cli/coverage
          if-no-files-found: warn
```

Reuse the exact same action SHAs already used by the `check` job for harden-runner / checkout / pnpm / setup-node. Do not change the `check` job’s `pnpm run test` step.

- [ ] **Step 2: Sanity-check YAML locally**

```bash
# structural check — job name present, upload-artifact pin present
rg -n "name: Coverage|upload-artifact@043fb46|test:coverage|coverage-job-summary" .github/workflows/ci.yml
```

Expected: matches for all.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "$(cat <<'EOF'
ci: add coverage job with summary and artifacts

EOF
)"
```

---

### Task 5: End-to-end verification

**Files:** none expected (fix only if verification finds gaps)

- [ ] **Step 1: Fresh coverage + summary + default tests**

```bash
pnpm install
pnpm build
pnpm test
pnpm test:coverage
node --test scripts/coverage-job-summary.test.mjs
node scripts/coverage-job-summary.mjs
pnpm docs:check:repo
```

Expected: all pass; summary prints two package rows.

- [ ] **Step 2: Confirm `pnpm check` still excludes coverage**

```bash
rg -n "test:coverage" package.json
# "check" script must NOT include test:coverage
node -e "const p=require('./package.json'); if (p.scripts.check.includes('test:coverage')) process.exit(1)"
```

Expected: exit 0.

- [ ] **Step 3: Commit only if fixes were needed**; otherwise no commit.

---

## Atomic commit groups (for review)

| Id | Concern | Files | Subject |
| --- | --- | --- | --- |
| 1 | Docs + scan ignore | developer shards, mdcp.config, DEVELOPERS.md | `docs: document Vitest coverage and ignore superpowers specs` |
| 2 | Vitest wiring | package.json files, vitest configs, lockfile | `chore: add Vitest coverage-v8 for core and cli packages` |
| 3 | Summary helper | `scripts/coverage-job-summary.*` | `feat: add coverage job-summary markdown helper` |
| 4 | CI job | `.github/workflows/ci.yml` | `ci: add coverage job with summary and artifacts` |
