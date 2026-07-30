import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { findMajorBumps, parseChangesetBumps } from './changeset-bumps.mjs';

describe('changeset-bumps', () => {
  it('parses package bump types from changeset frontmatter', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cs-bumps-'));
    writeFileSync(
      join(dir, 'one.md'),
      `---
'@bwilliamson/mdcp-cli': minor
"@bwilliamson/skill-mdcp": patch
---

Notes
`,
    );
    writeFileSync(join(dir, 'README.md'), '# ignore');
    const parsed = parseChangesetBumps(dir);
    assert.equal(parsed.length, 1);
    assert.deepEqual(parsed[0].bumps, {
      '@bwilliamson/mdcp-cli': 'minor',
      '@bwilliamson/skill-mdcp': 'patch',
    });
  });

  it('finds major bumps for the no-major policy gate', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cs-major-'));
    writeFileSync(
      join(dir, 'break.md'),
      `---
'@bwilliamson/mdcp-core': major
---

breaking
`,
    );
    writeFileSync(
      join(dir, 'ok.md'),
      `---
'@bwilliamson/mdcp-cli': patch
---

fine
`,
    );
    const majors = findMajorBumps(dir);
    assert.equal(majors.length, 1);
    assert.equal(majors[0].package, '@bwilliamson/mdcp-core');
    assert.equal(majors[0].file, 'break.md');
  });
});
