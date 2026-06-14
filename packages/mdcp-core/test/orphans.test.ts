import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { checkOrphansForGuides } from '../src/validate/orphans.js';
import { sectionFiles } from '../src/compile/assemble.js';
import { useTmpDir } from './helpers/tmp-dir.js';

describe('checkOrphansForGuides', () => {
  const work = useTmpDir('mdcp-orphans-');

  function setup() {
    const guide = join(work.path, 'guide');
    mkdirSync(guide, { recursive: true });
    writeFileSync(join(guide, 'index.md'), '# G\n\n- [a](./a.md)\n');
    writeFileSync(join(guide, 'a.md'), '# A\n');
    return guide;
  }

  it('returns no issues for consistent tree', () => {
    const guide = setup();
    const issues = checkOrphansForGuides([{ name: 'guide', dir: guide }]);
    expect(issues).toEqual([]);
  });

  it('detects orphan shard', () => {
    const guide = setup();
    writeFileSync(join(guide, 'orphan.md'), '# Orphan\n');
    const issues = checkOrphansForGuides([{ name: 'guide', dir: guide }]);
    expect(issues.some((i) => i.type === 'orphan_shard')).toBe(true);
  });

  it('detects missing guide directory', () => {
    const issues = checkOrphansForGuides([{ name: 'missing', dir: join(work.path, 'nope') }]);
    expect(issues.some((i) => i.type === 'missing_guide')).toBe(true);
  });

  it('detects broken manifest entry', () => {
    const guide = setup();
    writeFileSync(join(guide, 'sections.txt'), 'missing.md\n');
    const issues = checkOrphansForGuides([{ name: 'guide', dir: guide }]);
    expect(issues.some((i) => i.type === 'broken_manifest')).toBe(true);
  });

  it('resolves sections.txt paths relative to guide dir', () => {
    const guide = setup();
    writeFileSync(join(guide, 'sections.txt'), 'a.md\n');
    expect(sectionFiles(guide)).toEqual([resolve(guide, 'a.md')]);
  });
});
