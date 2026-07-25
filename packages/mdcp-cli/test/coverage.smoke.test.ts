import { describe, it, expect } from 'vitest';
import { execFile, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '../dist/cli.js');
const execFileAsync = promisify(execFile);

/**
 * Project fixture: one guide `g`, a monolith output target `guides.md`, a
 * standalone `SECURITY.md`, and an uncaptured `stray.md`.
 */
function writeCoverageFixture(): string {
  const project = mkdtempSync(join(tmpdir(), 'mdcp-coverage-cli-'));
  const guide = join(project, 'g');
  mkdirSync(guide, { recursive: true });
  writeFileSync(join(guide, 'index.md'), '# G\n\n- [section](section.md)\n');
  writeFileSync(join(guide, 'section.md'), '# G\n\n## Hello\n');
  writeFileSync(join(project, 'SECURITY.md'), '# Security policy\n');
  writeFileSync(join(project, 'stray.md'), '# Stray\n\nNot captured by any guide.\n');
  writeFileSync(join(project, 'guides.md'), '# G\n');
  writeFileSync(
    join(project, 'mdcp.config.json'),
    JSON.stringify({
      outputDir: '.',
      outputFile: 'guides.md',
      compileOrder: ['g'],
      guides: [{ name: 'g', path: 'g' }],
      standaloneGuides: ['SECURITY.md'],
      scan: { gitignore: false },
      refs: { registryFile: 'refs.json' },
      lint: { links: { enabled: false }, xrefs: { enabled: false } },
    }),
  );
  return project;
}

describe('mdcp coverage', () => {
  it('emits captured, uncaptured, standalone, and missing sets as JSON', async () => {
    const project = writeCoverageFixture();
    try {
      const { stdout } = await execFileAsync(
        'node',
        [CLI, 'coverage', '--config', 'mdcp.config.json', '--docs-root', '.', '--json'],
        { encoding: 'utf-8', cwd: project },
      );
      const result = JSON.parse(stdout);
      expect(result.captured).toContain('g/index.md');
      expect(result.captured).toContain('g/section.md');
      expect(result.captured).toContain('guides.md');
      expect(result.captured).toContain('SECURITY.md');
      expect(result.uncaptured).toContain('stray.md');
      expect(result.standalone).toEqual(['SECURITY.md']);
      expect(result.missingStandalone).toEqual([]);
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });

  it('prints a human-readable summary and exits 0 by default', () => {
    const project = writeCoverageFixture();
    try {
      const r = spawnSync(
        'node',
        [CLI, 'coverage', '--config', 'mdcp.config.json', '--docs-root', '.'],
        { encoding: 'utf-8', cwd: project },
      );
      expect(r.status).toBe(0);
      expect(r.stdout).toMatch(/captured: \d+/);
      expect(r.stdout).toContain('uncaptured: stray.md');
      expect(r.stdout).toContain('standalone: SECURITY.md');
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });

  it('exits 1 with --strict when uncaptured files exist', () => {
    const project = writeCoverageFixture();
    try {
      const r = spawnSync(
        'node',
        [CLI, 'coverage', '--config', 'mdcp.config.json', '--docs-root', '.', '--strict'],
        { encoding: 'utf-8', cwd: project },
      );
      expect(r.status).toBe(1);
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });

  it('reports missing standaloneGuides entries', () => {
    const project = writeCoverageFixture();
    try {
      writeFileSync(
        join(project, 'mdcp.config.json'),
        JSON.stringify({
          outputDir: '.',
          outputFile: 'guides.md',
          compileOrder: ['g'],
          guides: [{ name: 'g', path: 'g' }],
          standaloneGuides: ['SECURITY.md', 'does-not-exist.md'],
          scan: { gitignore: false },
          refs: { registryFile: 'refs.json' },
          lint: { links: { enabled: false }, xrefs: { enabled: false } },
        }),
      );
      const r = spawnSync(
        'node',
        [CLI, 'coverage', '--config', 'mdcp.config.json', '--docs-root', '.'],
        { encoding: 'utf-8', cwd: project },
      );
      expect(r.status).toBe(0);
      expect(r.stdout).toContain('missing-standalone: does-not-exist.md');
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });

  it('mdcp check prints a non-fatal coverage summary and still exits 0', () => {
    const project = writeCoverageFixture();
    try {
      const r = spawnSync(
        'node',
        [CLI, 'check', '--config', 'mdcp.config.json', '--docs-root', '.', '--skip-vale'],
        { encoding: 'utf-8', cwd: project },
      );
      expect(r.status).toBe(0);
      expect(r.stdout).toContain('mdcp check passed');
      const combined = `${r.stdout}${r.stderr}`;
      expect(combined).toMatch(/coverage: \d+ markdown file\(s\) not captured/);
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });
});
