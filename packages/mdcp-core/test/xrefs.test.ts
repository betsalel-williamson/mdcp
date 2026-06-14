import { describe, it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lintXrefs } from '../src/xrefs/lint.js';
import { useTmpDir } from './helpers/tmp-dir.js';

describe('lintXrefs', () => {
  const work = useTmpDir('mdcp-xrefs-');

  it('flags bare See Section N', () => {
    writeFileSync(join(work.path, 'bad.md'), 'See Section 2 for details.\n');
    const issues = lintXrefs([work.path]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatch(/bare cross-ref|unlinked/i);
  });

  it('allows markdown links', () => {
    writeFileSync(join(work.path, 'ok.md'), 'See [Section 2](./other.md#section-2) for details.\n');
    expect(lintXrefs([work.path])).toEqual([]);
  });

  it('ignores bare refs inside fenced code', () => {
    writeFileSync(join(work.path, 'ok.md'), '```\nSee Section 2\n```\n');
    expect(lintXrefs([work.path])).toEqual([]);
  });
});
