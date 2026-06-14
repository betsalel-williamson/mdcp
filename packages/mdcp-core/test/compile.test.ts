import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { compileGuides, assembleGuide, writeCompiledGuides } from '../src/compile/assemble.js';

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

  it('keeps a single document H1 when merging multiple guides', () => {
    const output = compileGuides({
      guidesRoot: FIXTURE,
      compileOrder: COMPILE_ORDER,
    });
    const h1Count = output.split('\n').filter((line) => /^# /.test(line)).length;
    expect(h1Count).toBe(1);
    expect(output).toMatch(/^# Documentation Overview/m);
    expect(output).toContain('## Admin Guide');
    expect(output).toContain('## Coverage and where to look');
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

  it('writes monolith and publish outputs in mixed mode', () => {
    const work = join(tmpdir(), `mdcp-mixed-${Date.now()}`);
    const monolithDir = join(work, 'main');
    const publishDir = join(work, 'publish');
    mkdirSync(monolithDir, { recursive: true });
    mkdirSync(publishDir, { recursive: true });

    writeFileSync(join(monolithDir, 'index.md'), '# Main Guide\n\n- [Intro](intro.md)\n');
    writeFileSync(join(monolithDir, 'intro.md'), '# Intro\n\nMonolith content.\n');
    writeFileSync(join(monolithDir, 'sections.txt'), 'intro.md\n');

    writeFileSync(join(publishDir, 'index.md'), '# Publish Guide\n\n- [Readme](readme.md)\n');
    writeFileSync(join(publishDir, 'readme.md'), '# @example/pkg\n\nPublish content.\n');
    writeFileSync(join(publishDir, 'sections.txt'), 'readme.md\n');

    const publishOut = join(work, 'out', 'README.md');
    const monolithOut = join(work, 'guides.md');
    const opts = {
      guidesRoot: work,
      compileOrder: ['main', 'publish'],
      banner: '<!-- banner -->\n\n',
      cwd: work,
      guides: [
        { name: 'main', splitLevel: 2 as const },
        {
          name: 'publish',
          splitLevel: 2 as const,
          compile: {
            outputFile: 'out/README.md',
            includeBanner: false,
            preambleSection: 'about-this-guide.md',
            manifest: 'index.md',
            stripAnchors: true,
          },
        },
      ],
    } satisfies Parameters<typeof writeCompiledGuides>[0];

    const written = writeCompiledGuides(opts, monolithOut);
    expect(written.map((w) => w.path).sort()).toEqual([monolithOut, publishOut].sort());

    const monolith = compileGuides(opts);
    expect(monolith).toContain('<!-- banner -->');
    expect(monolith).toContain('Main Guide');
    expect(monolith).toContain('Intro');
    expect(monolith).not.toContain('@example/pkg');

    const publishText = readFileSync(publishOut, 'utf-8');
    expect(publishText).toContain('@example/pkg');
    expect(publishText).not.toContain('<!-- banner -->');

    rmSync(work, { recursive: true, force: true });
  });

  it('rewrites intra-guide .md links to anchors in publish output', () => {
    const work = join(tmpdir(), `mdcp-publish-links-${Date.now()}`);
    const guideDir = join(work, 'guide');
    mkdirSync(guideDir, { recursive: true });

    writeFileSync(join(guideDir, 'index.md'), '# @example/mdcp-cli\n\n');
    writeFileSync(
      join(guideDir, 'install-and-quick-start.md'),
      '# Install and quick start\n\nCollaborating with an LLM? See [LLM collaboration](./llm-collaboration.md) for details.\n',
    );
    writeFileSync(join(guideDir, 'llm-collaboration.md'), '# LLM collaboration\n\nContent.\n');
    writeFileSync(
      join(guideDir, 'sections.txt'),
      'install-and-quick-start.md\nllm-collaboration.md\n',
    );

    const publishOut = join(work, 'README.md');
    const opts = {
      guidesRoot: work,
      compileOrder: ['guide'],
      cwd: work,
      guides: [
        {
          name: 'guide',
          compile: { outputFile: 'README.md', includeBanner: false },
        },
      ],
    } satisfies Parameters<typeof writeCompiledGuides>[0];

    writeCompiledGuides(opts, join(work, 'guides.md'));
    const text = readFileSync(publishOut, 'utf-8');
    expect(text).toContain('[LLM collaboration](#llm-collaboration)');
    expect(text).not.toMatch(/\]\(\.\/llm-collaboration\.md\)/);

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
