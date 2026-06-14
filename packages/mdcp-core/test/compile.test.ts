import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
  compileGuides,
  assembleGuide,
  writeCompiledGuides,
  type CompileOptionsInput,
} from '../src/compile/assemble.js';
import { withTmpDir } from './helpers/tmp-dir.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../..');
const FIXTURE = join(REPO_ROOT, 'examples/sample-guides');
const SAMPLE_CONFIG = 'examples/sample-guides/mdcp.config.json';
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
    withTmpDir('mdcp-compile-', (work) => {
      writeFileSync(join(work, 'index.md'), '# Example\n\n- [Section](section.md)\n');
      writeFileSync(join(work, 'section.md'), '## Term {#my-anchor}\n\nDefinition.\n');
      writeFileSync(join(work, 'sections.txt'), 'section.md\n');

      const out = assembleGuide(work, {
        title: 'Example glossary',
        manifest: 'index.md',
      });
      expect(out).not.toMatch(/\{#[a-z0-9-]+\}/i);
    });
  });

  it('writes monolith and publish outputs in mixed mode', () => {
    withTmpDir('mdcp-mixed-', (work) => {
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
      } satisfies CompileOptionsInput;

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
    });
  });

  it('rewrites intra-guide .md links to anchors in publish output', () => {
    withTmpDir('mdcp-publish-links-', (work) => {
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
            splitLevel: 2 as const,
            compile: {
              outputFile: 'README.md',
              includeBanner: false,
              preambleSection: 'about-this-guide.md',
              manifest: 'index.md',
              stripAnchors: true,
            },
          },
        ],
      } satisfies CompileOptionsInput;

      writeCompiledGuides(opts, join(work, 'guides.md'));
      const text = readFileSync(publishOut, 'utf-8');
      expect(text).toContain('[LLM collaboration](#llm-collaboration)');
      expect(text).not.toMatch(/\]\(\.\/llm-collaboration\.md\)/);
    });
  });

  it('rewrites intra-guide .md links in monolith output without outputFile', () => {
    withTmpDir('mdcp-monolith-links-', (work) => {
      const guideDir = join(work, 'guide');
      mkdirSync(guideDir, { recursive: true });

      writeFileSync(join(guideDir, 'index.md'), '# Feature Guide\n\n');
      writeFileSync(
        join(guideDir, 'intro.md'),
        '# Intro\n\nSee [Details](./details.md) for more.\n',
      );
      writeFileSync(join(guideDir, 'details.md'), '# Details\n\nBody.\n');
      writeFileSync(join(guideDir, 'sections.txt'), 'intro.md\ndetails.md\n');

      const out = compileGuides({
        guidesRoot: work,
        compileOrder: ['guide'],
      });
      expect(out).toContain('[Details](#details)');
      expect(out).not.toMatch(/\]\(\.\/details\.md\)/);
    });
  });

  it('does not rewrite publish path links without publishPathRewrite config', () => {
    withTmpDir('mdcp-no-path-rewrite-', (work) => {
      const guideDir = join(work, 'guide');
      mkdirSync(guideDir, { recursive: true });

      writeFileSync(join(guideDir, 'index.md'), '# @example/pkg\n\n');
      writeFileSync(
        join(guideDir, 'section.md'),
        '# Section\n\nSee [Config](../mdcp.config.json).\n',
      );
      writeFileSync(join(guideDir, 'sections.txt'), 'section.md\n');

      const publishOut = join(work, 'README.md');
      const opts = {
        guidesRoot: work,
        compileOrder: ['guide'],
        cwd: work,
        guides: [
          {
            name: 'guide',
            compile: {
              outputFile: 'README.md',
              includeBanner: false,
            },
          },
        ],
      } satisfies CompileOptionsInput;

      writeCompiledGuides(opts, join(work, 'guides.md'));
      const text = readFileSync(publishOut, 'utf-8');
      expect(text).toContain('[Config](../mdcp.config.json)');
    });
  });

  it('returns empty string when all guides have publish outputs', () => {
    withTmpDir('mdcp-all-publish-', (work) => {
      const guideDir = join(work, 'guide');
      mkdirSync(guideDir, { recursive: true });

      writeFileSync(join(guideDir, 'index.md'), '# Publish\n\n- [Body](body.md)\n');
      writeFileSync(join(guideDir, 'body.md'), '# Body\n\nContent.\n');
      writeFileSync(join(guideDir, 'sections.txt'), 'body.md\n');

      const out = compileGuides({
        guidesRoot: work,
        compileOrder: ['guide'],
        cwd: work,
        guides: [
          {
            name: 'guide',
            compile: { outputFile: 'README.md' },
          },
        ],
      });
      expect(out).toBe('');
    });
  });
});

describe('cli e2e', () => {
  it('mdcp compile exits 0 on sample-guides', () => {
    const out = execFileSync(
      'node',
      [CLI, 'compile', '--config', SAMPLE_CONFIG, '--cwd', FIXTURE],
      { encoding: 'utf-8', cwd: REPO_ROOT },
    );
    expect(out).toMatch(/guides\.md/);
    expect(existsSync(join(FIXTURE, 'guides.md'))).toBe(true);
  });

  it('mdcp refs lookup returns JSON matches', () => {
    const out = execFileSync(
      'node',
      [CLI, 'refs', 'lookup', 'admin', '--config', SAMPLE_CONFIG, '--cwd', FIXTURE],
      { encoding: 'utf-8', cwd: REPO_ROOT },
    );
    const matches = JSON.parse(out);
    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('mdcp check passes on sample-guides (core, no peer require)', () => {
    const out = execFileSync(
      'node',
      [CLI, 'check', '--config', SAMPLE_CONFIG, '--cwd', FIXTURE, '--skip-vale'],
      { encoding: 'utf-8', cwd: REPO_ROOT },
    );
    expect(out).toContain('mdcp check passed');
  });
});
