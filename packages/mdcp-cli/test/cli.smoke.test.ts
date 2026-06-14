import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '../dist/cli.js');
const FIXTURE = join(__dirname, '../../../examples/sample-guides');

describe('cli smoke', () => {
  it('prints version', () => {
    const out = execFileSync('node', [CLI, '--version'], { encoding: 'utf-8' });
    expect(out.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('compiles sample guides', () => {
    const out = execFileSync(
      'node',
      [CLI, 'compile', '--config', 'mdcp.config.json', '--cwd', FIXTURE],
      { encoding: 'utf-8' },
    );
    expect(out).toMatch(/guides\.md/);
    expect(existsSync(join(FIXTURE, 'guides.md'))).toBe(true);
  });

  it('checks sample guides with vale skipped', () => {
    const out = execFileSync(
      'node',
      [CLI, 'check', '--config', 'mdcp.config.json', '--cwd', FIXTURE, '--skip-vale'],
      { encoding: 'utf-8' },
    );
    expect(out).toContain('mdcp check passed');
  });
});
