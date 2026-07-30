import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  skillPackageName,
  skillIdFromPackageName,
  setSkillMdVersion,
  listSkillDirs,
} from './skill-packages.mjs';

describe('skill-packages', () => {
  it('maps skill ids to scoped private package names', () => {
    assert.equal(skillPackageName('mdcp'), '@bwilliamson/skill-mdcp');
    assert.equal(skillPackageName('mdcp-ux'), '@bwilliamson/skill-mdcp-ux');
    assert.equal(skillIdFromPackageName('@bwilliamson/skill-mdcp-ux'), 'mdcp-ux');
    assert.equal(skillIdFromPackageName('@bwilliamson/mdcp-cli'), null);
  });

  it('rewrites metadata.version without corrupting the YAML fence', () => {
    const dir = mkdtempSync(join(tmpdir(), 'skill-pkg-'));
    const skillPath = join(dir, 'SKILL.md');
    writeFileSync(
      skillPath,
      `---
name: demo
metadata:
  author: test
  version: '0.7.0'
  internal: true
---

# Demo
`,
    );
    assert.equal(setSkillMdVersion(skillPath, '0.8.1'), true);
    const next = readFileSync(skillPath, 'utf-8');
    assert.ok(next.startsWith('---\nname: demo\n'));
    assert.match(next, /version: '0\.8\.1'/);
    assert.match(next, /internal: true/);
    assert.equal(setSkillMdVersion(skillPath, '0.8.1'), false);
  });

  it('lists skill directories that contain SKILL.md', () => {
    const root = mkdtempSync(join(tmpdir(), 'skills-root-'));
    mkdirSync(join(root, 'skills', 'alpha'), { recursive: true });
    mkdirSync(join(root, 'skills', 'beta'), { recursive: true });
    writeFileSync(join(root, 'skills', 'alpha', 'SKILL.md'), '---\nname: a\n---\n');
    writeFileSync(join(root, 'skills', 'beta', 'README.md'), 'nope');
    assert.deepEqual(listSkillDirs(root), ['alpha']);
  });
});
