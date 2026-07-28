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
