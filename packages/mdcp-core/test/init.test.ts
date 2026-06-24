import { describe, expect, it } from 'vitest';
import { writeFileSync, mkdirSync, existsSync, rmSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { detectExistingDocs, runInit } from '../src/init/index.js';

const MDCP_REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('detectExistingDocs', () => {
  it('detects README and docs markdown', () => {
    const root = mkdtempSync(join(tmpdir(), 'mdcp-init-'));
    mkdirSync(join(root, 'docs'), { recursive: true });
    writeFileSync(join(root, 'README.md'), '# App\n', 'utf-8');
    writeFileSync(join(root, 'docs', 'guide.md'), '# Guide\n', 'utf-8');
    try {
      const result = detectExistingDocs(root, 'docs');
      expect(result.hasExistingDocs).toBe(true);
      expect(result.signals.some((s) => s.includes('README.md'))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('runInit', () => {
  it('scaffolds default preset with local fetch', async () => {
    const docsRoot = `.test-init/default-${Date.now()}`;
    const docsAbs = join(MDCP_REPO_ROOT, docsRoot);
    try {
      const result = await runInit({
        repoRoot: MDCP_REPO_ROOT,
        docsRoot,
        mode: 'default',
        preset: 'code',
        fetchLocal: true,
      });
      expect(result.mode).toBe('default');
      expect(existsSync(join(docsAbs, 'mdcp.config.json'))).toBe(true);
      expect(existsSync(join(docsAbs, 'glossary', 'index.md'))).toBe(true);
    } finally {
      rmSync(docsAbs, { recursive: true, force: true });
    }
  });

  it('writes adoption plan in augment mode', async () => {
    const docsRoot = `.test-init/augment-${Date.now()}`;
    const docsAbs = join(MDCP_REPO_ROOT, docsRoot);
    mkdirSync(join(docsAbs, 'features'), { recursive: true });
    writeFileSync(join(docsAbs, 'features', 'index.md'), '# Features\n', 'utf-8');
    writeFileSync(join(docsAbs, 'legacy.md'), '# Legacy\n', 'utf-8');
    try {
      const result = await runInit({
        repoRoot: MDCP_REPO_ROOT,
        docsRoot,
        mode: 'augment',
        preset: 'code',
        fetchLocal: true,
      });
      expect(result.mode).toBe('augment');
      expect(existsSync(join(docsAbs, 'extensions', 'adoption-plan.md'))).toBe(true);
    } finally {
      rmSync(docsAbs, { recursive: true, force: true });
    }
  });
});
