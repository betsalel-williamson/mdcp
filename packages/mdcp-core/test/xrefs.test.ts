import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { lintXrefs } from '../src/xrefs/lint.js';

describe('lintXrefs', () => {
  const work = join(tmpdir(), `mdcp-xrefs-${Date.now()}`);

  it('flags bare See Section N', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(join(work, 'bad.md'), 'See Section 2 for details.\n');
    const issues = lintXrefs([work]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatch(/bare cross-ref|unlinked/i);
    rmSync(work, { recursive: true, force: true });
  });

  it('allows markdown links', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(
      join(work, 'ok.md'),
      'See [Section 2](./other.md#section-2) for details.\n',
    );
    expect(lintXrefs([work])).toEqual([]);
    rmSync(work, { recursive: true, force: true });
  });

  it('ignores bare refs inside fenced code', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(
      join(work, 'ok.md'),
      '```\nSee Section 2\n```\n',
    );
    expect(lintXrefs([work])).toEqual([]);
    rmSync(work, { recursive: true, force: true });
  });
});
