import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkOrphansForGuides } from '../src/validate/orphans.js';
import { sectionFiles } from '../src/compile/assemble.js';
import { resolve } from 'node:path';

describe('checkOrphansForGuides', () => {
  const work = join(tmpdir(), `mdcp-orphans-${Date.now()}`);

  function setup() {
    mkdirSync(work, { recursive: true });
    const guide = join(work, 'guide');
    mkdirSync(guide, { recursive: true });
    writeFileSync(join(guide, 'index.md'), '# G\n\n- [a](./a.md)\n');
    writeFileSync(join(guide, 'a.md'), '# A\n');
    return guide;
  }

  it('returns no issues for consistent tree', () => {
    const guide = setup();
    const issues = checkOrphansForGuides([{ name: 'guide', dir: guide }]);
    expect(issues).toEqual([]);
    rmSync(work, { recursive: true, force: true });
  });

  it('detects orphan shard', () => {
    const guide = setup();
    writeFileSync(join(guide, 'orphan.md'), '# Orphan\n');
    const issues = checkOrphansForGuides([{ name: 'guide', dir: guide }]);
    expect(issues.some((i) => i.type === 'orphan_shard')).toBe(true);
    rmSync(work, { recursive: true, force: true });
  });

  it('detects missing guide directory', () => {
    const issues = checkOrphansForGuides([{ name: 'missing', dir: join(work, 'nope') }]);
    expect(issues.some((i) => i.type === 'missing_guide')).toBe(true);
  });

  it('detects broken manifest entry', () => {
    const guide = setup();
    writeFileSync(join(guide, 'sections.txt'), 'missing.md\n');
    const issues = checkOrphansForGuides([{ name: 'guide', dir: guide }]);
    expect(issues.some((i) => i.type === 'broken_manifest')).toBe(true);
    rmSync(work, { recursive: true, force: true });
  });

  it('resolves sections.txt paths relative to guide dir', () => {
    const guide = setup();
    writeFileSync(join(guide, 'sections.txt'), 'a.md\n');
    expect(sectionFiles(guide)).toEqual([resolve(guide, 'a.md')]);
    rmSync(work, { recursive: true, force: true });
  });
});
