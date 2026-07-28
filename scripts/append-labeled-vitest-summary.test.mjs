import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { relabelVitestJobSummary } from './append-labeled-vitest-summary.mjs';

describe('relabelVitestJobSummary', () => {
  it('replaces the hardcoded Vitest H2 with a package label', () => {
    const dump = '## Vitest Test Report\n\n| File | Tests |\n| --- | --- |\n| a.ts | 1 |\n';
    const out = relabelVitestJobSummary('mdcp-core', dump);
    assert.match(out, /^## mdcp-core — Vitest\n/);
    assert.doesNotMatch(out, /## Vitest Test Report/);
    assert.match(out, /\| a\.ts \| 1 \|/);
  });

  it('prefixes a label when the dump has no Vitest H2', () => {
    const out = relabelVitestJobSummary('mdcp-cli', 'some body\n');
    assert.equal(out, '## mdcp-cli — Vitest\n\nsome body\n');
  });

  it('emits a labeled stub when the dump is empty', () => {
    const out = relabelVitestJobSummary('mdcp-core', '');
    assert.match(out, /^## mdcp-core — Vitest\n/);
    assert.match(out, /no Vitest job summary produced/);
  });
});
