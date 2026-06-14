import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { compileGuides, assembleGuide } from '../src/compile/assemble.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, '../../../examples/sample-guides');
const COMPILE_ORDER = ['overview', 'admin-guide', 'developer-guide'];
const CLI = join(__dirname, '../../mdcp-cli/dist/cli.js');

describe('compileGuides', () => {
  it('produces compiled output from sample fixture', () => {
    const output = compileGuides({
      guidesRoot: FIXTURE,
      compileOrder: COMPILE_ORDER,
      guides: [
        {
          name: 'overview',
          splitLevel: 2,
          compile: {
            keepSecondH1: ['coverage-and-where-to-look'],
            preambleSection: 'about-this-guide.md',
            manifest: 'index.md',
            stripAnchors: true,
          },
        },
      ],
    });

    expect(output).toContain('# Documentation Overview');
    expect(output).toContain('Admin Chapter 1');
    expect(output).toContain('Dev Chapter 1');
    expect(output.split('\n').length).toBeGreaterThan(20);
  });

  it('includes guide H1 headings', () => {
    const output = compileGuides({
      guidesRoot: FIXTURE,
      compileOrder: ['admin-guide'],
    });
    expect(output).toMatch(/^# Admin Guide/m);
    expect(output).toContain('Admin Chapter 1');
  });

  it('strips explicit anchor markers from compiled output', () => {
    const work = join(tmpdir(), `mdcp-compile-${Date.now()}`);
    mkdirSync(work, { recursive: true });
    writeFileSync(join(work, 'index.md'), '# Example\n\n- [Section](section.md)\n');
    writeFileSync(join(work, 'section.md'), '## Term {#my-anchor}\n\nDefinition.\n');
    writeFileSync(join(work, 'sections.txt'), 'section.md\n');

    const out = assembleGuide(work, {
      title: 'Example glossary',
      manifest: 'index.md',
    });
    expect(out).not.toMatch(/\{#[a-z0-9-]+\}/i);
    rmSync(work, { recursive: true, force: true });
  });
});

describe('cli e2e', () => {
  it('mdcp compile exits 0 on sample-guides', () => {
    const out = execFileSync(
      'node',
      [CLI, 'compile', '--config', 'mdcp.config.json', '--cwd', FIXTURE],
      { encoding: 'utf-8' },
    );
    expect(out).toMatch(/guides\.md/);
    expect(existsSync(join(FIXTURE, 'guides.md'))).toBe(true);
  });

  it('mdcp refs lookup returns JSON matches', () => {
    const out = execFileSync(
      'node',
      [CLI, 'refs', 'lookup', 'admin', '--config', 'mdcp.config.json', '--cwd', FIXTURE],
      { encoding: 'utf-8' },
    );
    const matches = JSON.parse(out);
    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('mdcp check passes on sample-guides (core, no peer require)', () => {
    const out = execFileSync(
      'node',
      [CLI, 'check', '--config', 'mdcp.config.json', '--cwd', FIXTURE, '--skip-vale'],
      { encoding: 'utf-8' },
    );
    expect(out).toContain('mdcp check passed');
  });
});
