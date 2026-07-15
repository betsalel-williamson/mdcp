import { describe, it, expect } from 'vitest';
import { execFile, execFileSync, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '../dist/cli.js');
const REPO_ROOT = join(__dirname, '../../..');
const FIXTURE = join(REPO_ROOT, 'examples/sample-guides');
const SAMPLE_CONFIG = 'examples/sample-guides/mdcp.config.json';
const execFileAsync = promisify(execFile);

async function runCli(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync('node', [CLI, ...args], { encoding: 'utf-8', cwd });
  return stdout;
}
const SHARDS_PRESET = join(
  REPO_ROOT,
  'packages/mdcp-presets/markdownlint-shards.markdownlint-cli2.jsonc',
);

function valeInstalled(): boolean {
  return spawnSync('vale', ['--version'], { encoding: 'utf-8' }).status === 0;
}

function writeInScopeLintFixture(docs: string, configExtra: Record<string, unknown> = {}): void {
  mkdirSync(join(docs, 'guide'), { recursive: true });
  mkdirSync(join(docs, 'other-guide'), { recursive: true });
  writeFileSync(
    join(docs, 'getting-started.md'),
    'This legacy flat doc has no top-level heading.\n',
  );
  writeFileSync(
    join(docs, 'other-guide', 'stray.md'),
    'Unregistered guide content without a heading.\n',
  );
  writeFileSync(join(docs, 'guide', 'index.md'), '# Guide\n\n- [section](section.md)\n');
  writeFileSync(join(docs, 'guide', 'section.md'), '# Guide\n\n## Hello\n');
  writeFileSync(
    join(docs, 'mdcp.config.json'),
    JSON.stringify({
      outputDir: '.',
      outputFile: 'guides.md',
      compileOrder: ['guide'],
      guides: [{ name: 'guide', path: 'guide' }],
      refs: { registryFile: 'refs.json' },
      lint: {
        xrefs: { enabled: false },
        markdownlint: { shardsConfig: SHARDS_PRESET },
      },
      ...configExtra,
    }),
  );
}

describe('cli smoke', () => {
  it('prints version', () => {
    const out = execFileSync('node', [CLI, '--version'], { encoding: 'utf-8' });
    expect(out.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('compiles sample guides', () => {
    const out = execFileSync(
      'node',
      [CLI, 'compile', '--config', SAMPLE_CONFIG, '--docs-root', FIXTURE],
      { encoding: 'utf-8', cwd: REPO_ROOT },
    );
    expect(out).toMatch(/guides\.md/);
    expect(existsSync(join(FIXTURE, '_build', 'guides.md'))).toBe(true);
  });

  it('checks sample guides with vale skipped', () => {
    const out = execFileSync(
      'node',
      [CLI, 'check', '--config', SAMPLE_CONFIG, '--docs-root', FIXTURE, '--skip-vale'],
      { encoding: 'utf-8', cwd: REPO_ROOT },
    );
    expect(out).toContain('mdcp check passed');
  });

  it('resolves --config from invocation directory, not --docs-root (#10)', async () => {
    const project = mkdtempSync(join(tmpdir(), 'mdcp-config-cwd-'));
    try {
      const docs = join(project, 'docs');
      const guide = join(docs, 'g');
      mkdirSync(guide, { recursive: true });
      writeFileSync(join(guide, 'index.md'), '# Guide\n\n- [section](section.md)\n');
      writeFileSync(join(guide, 'section.md'), '# Guide\n\n## Hello\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '_build',
          outputFile: 'guides.md',
          compileOrder: ['g'],
          guides: [{ name: 'g', path: 'g' }],
          lint: { xrefs: { enabled: false }, links: { enabled: false } },
        }),
      );

      const out = await runCli(
        ['compile', '--config', 'docs/mdcp.config.json', '--docs-root', 'docs'],
        project,
      );
      expect(out).toMatch(/guides\.md|→/);
      expect(existsSync(join(docs, '_build', 'guides.md'))).toBe(true);
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });

  it('writes refs.registryFile under outputDir after compile when guides use nested outputFile (#62)', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-smoke-'));
    try {
      const guide = join(docs, 'guide-a');
      mkdirSync(guide, { recursive: true });
      writeFileSync(join(guide, 'index.md'), '# Guide A\n\n- [Section one](section-1.md)\n');
      writeFileSync(join(guide, 'section-1.md'), '# Section one\n\nBody text.\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '_build',
          compileOrder: ['guide-a'],
          guides: [{ name: 'guide-a', compile: { outputFile: 'compiled/guide-a.md' } }],
          refs: { registryFile: '.caches/refs.json' },
          lint: { links: { enabled: false }, xrefs: { enabled: false } },
        }),
      );

      execFileSync('node', [CLI, 'compile', '--config', 'mdcp.config.json', '--docs-root', docs], {
        encoding: 'utf-8',
        cwd: docs,
      });

      expect(existsSync(join(docs, '_build/.caches/refs.json'))).toBe(true);
      expect(existsSync(join(docs, '_build/compiled/refs.json'))).toBe(false);

      const listed = execFileSync(
        'node',
        [CLI, 'refs', 'list', '--config', 'mdcp.config.json', '--docs-root', docs],
        { encoding: 'utf-8', cwd: docs },
      );
      expect(listed).toContain('section-one');
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('normalizes cwd-relative refs.registryFile under outputDir (#11)', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-smoke-'));
    try {
      const guide = join(docs, 'g');
      mkdirSync(guide, { recursive: true });
      writeFileSync(join(guide, 'index.md'), '# Guide\n\n- [intro](introduction.md)\n');
      writeFileSync(join(guide, 'introduction.md'), '# Guide\n\n## Hello\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '_build/compiled',
          outputFile: 'guides.md',
          compileOrder: ['g'],
          guides: [{ name: 'g', path: 'g' }],
          refs: { registryFile: '.caches/refs.json' },
          lint: { xrefs: { enabled: false } },
        }),
      );

      execFileSync(
        'node',
        [CLI, 'check', '--config', 'mdcp.config.json', '--docs-root', docs, '--skip-vale'],
        { encoding: 'utf-8', cwd: docs },
      );
      expect(existsSync(join(docs, '_build/compiled/.caches/refs.json'))).toBe(true);
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('creates cache backup on re-compile with --backup', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-backup-smoke-'));
    try {
      const guide = join(docs, 'g');
      mkdirSync(guide, { recursive: true });
      writeFileSync(join(guide, 'index.md'), '# Guide\n\n- [intro](introduction.md)\n');
      writeFileSync(join(guide, 'introduction.md'), '# Guide\n\n## Hello\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '_build',
          outputFile: 'guides.md',
          compileOrder: ['g'],
          guides: [{ name: 'g', path: 'g' }],
          lint: { xrefs: { enabled: false } },
        }),
      );

      execFileSync('node', [CLI, 'compile', '--config', 'mdcp.config.json', '--docs-root', docs], {
        encoding: 'utf-8',
        cwd: docs,
      });
      const outPath = join(docs, '_build', 'guides.md');
      writeFileSync(outPath, 'stale monolith\n');

      execFileSync(
        'node',
        [CLI, 'compile', '--config', 'mdcp.config.json', '--docs-root', docs, '--backup'],
        { encoding: 'utf-8', cwd: docs },
      );

      const backupPath = join(docs, '_build', '.caches', 'backups', '_build', 'guides.md');
      expect(existsSync(backupPath)).toBe(true);
      expect(readFileSync(backupPath, 'utf-8')).toBe('stale monolith\n');
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('rejects removed export command', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-export-gone-'));
    try {
      const guide = join(docs, 'g');
      mkdirSync(guide, { recursive: true });
      writeFileSync(join(guide, 'index.md'), '# Guide\n\n- [intro](introduction.md)\n');
      writeFileSync(join(guide, 'introduction.md'), '# Guide\n\n## Hello\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '_build',
          outputFile: 'guides.md',
          compileOrder: ['g'],
          guides: [{ name: 'g', path: 'g' }],
        }),
      );

      expect(() =>
        execFileSync(
          'node',
          [CLI, 'export', '--llm', '--config', 'mdcp.config.json', '--docs-root', docs],
          { encoding: 'utf-8', cwd: docs },
        ),
      ).toThrow();
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('writes default per-guide output under outputDir', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-outfile-'));
    try {
      const guide = join(docs, 'glossary');
      mkdirSync(guide, { recursive: true });
      writeFileSync(join(guide, 'index.md'), '# Glossary\n\n- [term](term.md)\n');
      writeFileSync(join(guide, 'term.md'), '# Glossary\n\n## Term\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '_build/compiled',
          compileOrder: ['glossary'],
          guides: [{ name: 'glossary' }],
          lint: { xrefs: { enabled: false } },
        }),
      );

      execFileSync('node', [CLI, 'compile', '--config', 'mdcp.config.json', '--docs-root', docs], {
        encoding: 'utf-8',
        cwd: docs,
      });
      expect(existsSync(join(docs, '_build/compiled/guide.md'))).toBe(true);
      expect(existsSync(join(docs, 'glossary.md'))).toBe(false);
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('skips out-of-scope markdown for shard lint (#17)', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-scope-'));
    try {
      writeInScopeLintFixture(docs);
      const out = execFileSync(
        'node',
        [
          CLI,
          'check',
          '--config',
          'mdcp.config.json',
          '--docs-root',
          docs,
          '--skip-vale',
          '--require-lint',
        ],
        { encoding: 'utf-8', cwd: docs },
      );
      expect(out).toContain('mdcp check passed');
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('honors shardsGlobs override for shard lint (#17)', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-shards-globs-'));
    try {
      mkdirSync(join(docs, 'narrow'), { recursive: true });
      mkdirSync(join(docs, 'wide'), { recursive: true });
      writeFileSync(join(docs, 'narrow', 'index.md'), '# Narrow\n\n- [a](a.md)\n');
      writeFileSync(join(docs, 'narrow', 'a.md'), '# Narrow\n\n## A\n');
      writeFileSync(join(docs, 'wide', 'index.md'), '# Wide\n\n- [b](b.md)\n');
      writeFileSync(join(docs, 'wide', 'b.md'), 'No heading — would fail MD041 if linted.\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '.',
          outputFile: 'guides.md',
          compileOrder: ['narrow', 'wide'],
          guides: [
            { name: 'narrow', path: 'narrow' },
            { name: 'wide', path: 'wide' },
          ],
          refs: { registryFile: 'refs.json' },
          lint: {
            xrefs: { enabled: false },
            markdownlint: {
              shardsConfig: SHARDS_PRESET,
              shardsGlobs: ['narrow'],
            },
          },
        }),
      );

      const out = execFileSync(
        'node',
        [
          CLI,
          'check',
          '--config',
          'mdcp.config.json',
          '--docs-root',
          docs,
          '--skip-vale',
          '--require-lint',
        ],
        { encoding: 'utf-8', cwd: docs },
      );
      expect(out).toContain('mdcp check passed');
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('skips out-of-scope markdown for Vale prose (#17)', () => {
    if (!valeInstalled()) return;

    const docs = mkdtempSync(join(tmpdir(), 'mdcp-vale-scope-'));
    try {
      writeInScopeLintFixture(docs);
      writeFileSync(
        join(docs, '.vale.ini'),
        `StylesPath = ${join(REPO_ROOT, 'docs/styles')}\nMinAlertLevel = error\n`,
      );

      execFileSync(
        'node',
        [CLI, 'check', '--config', 'mdcp.config.json', '--docs-root', docs, '--require-lint'],
        { encoding: 'utf-8', cwd: docs },
      );
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('exits 1 on broken internal links by default', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-link-fail-'));
    try {
      mkdirSync(join(docs, 'g'), { recursive: true });
      writeFileSync(join(docs, 'g', 'index.md'), '# G\n\n- [s](s.md)\n');
      writeFileSync(join(docs, 'g', 's.md'), '# G\n\n## Hi\n\n[bad](#nope)\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '.',
          outputFile: 'guides.md',
          compileOrder: ['g'],
          guides: [{ name: 'g', path: 'g' }],
          refs: { registryFile: 'refs.json' },
          lint: { links: { enabled: true }, xrefs: { enabled: false } },
        }),
      );

      const r = spawnSync(
        'node',
        [CLI, 'check', '--config', 'mdcp.config.json', '--docs-root', docs, '--skip-vale'],
        { encoding: 'utf-8', cwd: docs },
      );
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/link:/);
      expect(r.stderr).toMatch(/mdcp check failed:/);
      expect(r.stderr).toMatch(/built-in links:/);
      expect(r.stderr).toMatch(/dead anchor:/);
      expect(r.stderr).toMatch(/Resolve the diagnostics above, then re-run: mdcp check/);
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('exits 0 with --warn-broken-links and prints link-warn', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-link-warn-'));
    try {
      mkdirSync(join(docs, 'g'), { recursive: true });
      writeFileSync(join(docs, 'g', 'index.md'), '# G\n\n- [s](s.md)\n');
      writeFileSync(join(docs, 'g', 's.md'), '# G\n\n## Hi\n\n[bad](#nope)\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '.',
          outputFile: 'guides.md',
          compileOrder: ['g'],
          guides: [{ name: 'g', path: 'g' }],
          refs: { registryFile: 'refs.json' },
          lint: { links: { enabled: true }, xrefs: { enabled: false } },
        }),
      );

      const r = spawnSync(
        'node',
        [
          CLI,
          'check',
          '--config',
          'mdcp.config.json',
          '--docs-root',
          docs,
          '--skip-vale',
          '--warn-broken-links',
        ],
        { encoding: 'utf-8', cwd: docs },
      );
      expect(r.status).toBe(0);
      expect(r.stderr).toMatch(/link-warn:/);
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('mdcp compile exits 1 when output contains broken link', () => {
    const docs = mkdtempSync(join(tmpdir(), 'mdcp-compile-link-'));
    try {
      mkdirSync(join(docs, 'g'), { recursive: true });
      writeFileSync(join(docs, 'g', 'index.md'), '# G\n\n- [s](s.md)\n');
      writeFileSync(join(docs, 'g', 's.md'), '# G\n\n## Hi\n\n[bad](#nope)\n');
      writeFileSync(
        join(docs, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '.',
          outputFile: 'guides.md',
          compileOrder: ['g'],
          guides: [{ name: 'g', path: 'g' }],
          refs: { registryFile: 'refs.json' },
          lint: { links: { enabled: true } },
        }),
      );

      const r = spawnSync(
        'node',
        [CLI, 'compile', '--config', 'mdcp.config.json', '--docs-root', docs],
        { encoding: 'utf-8', cwd: docs },
      );
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/link:/);
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });
});
