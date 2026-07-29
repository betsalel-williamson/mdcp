import { describe, it, expect } from 'vitest';
import {
  evaluateDocCoverage,
  docCoverageExitCode,
  normalizeChangedPath,
} from '../src/validate/doc-coverage.js';

describe('normalizeChangedPath', () => {
  it('strips leading ./ and normalizes separators', () => {
    expect(normalizeChangedPath('./packages/foo/bar.ts')).toBe('packages/foo/bar.ts');
  });
});

describe('evaluateDocCoverage', () => {
  it('marks docs-only changes as covered', () => {
    const result = evaluateDocCoverage({
      changedPaths: ['docs/features/overview.md', 'docs/features/index.md'],
    });
    expect(result.status).toBe('covered');
    expect(result.docsChanged).toContain('docs/features/overview.md');
    expect(result.docSurfaces).toContain('features');
    expect(result.questions).toEqual([]);
  });

  it('reports missing_docs for product source without feature/client shards', () => {
    const result = evaluateDocCoverage({
      changedPaths: ['packages/mdcp-cli/src/cli.ts'],
      mode: 'advisory',
    });
    expect(result.status).toBe('missing_docs');
    expect(result.docSurfaces).toEqual(expect.arrayContaining(['features', 'client']));
    expect(result.candidateShards).toEqual(
      expect.arrayContaining(['docs/features/', 'docs/client/']),
    );
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.codeChanged).toContain('packages/mdcp-cli/src/cli.ts');
  });

  it('covers product source when matching docs are in the change set', () => {
    const result = evaluateDocCoverage({
      changedPaths: [
        'packages/mdcp-cli/src/cli.ts',
        'docs/features/doc-coverage-evaluation.md',
        'docs/client-cli/evaluate-doc-coverage.md',
      ],
    });
    expect(result.status).toBe('covered');
    expect(result.candidateShards).toEqual([]);
  });

  it('reports missing_docs for developer tooling without developer shards', () => {
    const result = evaluateDocCoverage({
      changedPaths: ['.github/workflows/ci.yml', 'scripts/release-tag.mjs'],
    });
    expect(result.status).toBe('missing_docs');
    expect(result.docSurfaces).toEqual(['developer']);
    expect(result.candidateShards).toEqual(['docs/developer/']);
  });

  it('returns needs_clarification for ambiguous-only paths', () => {
    const result = evaluateDocCoverage({
      changedPaths: ['mystery/opaque.bin', 'notes/scratch.txt'],
    });
    expect(result.status).toBe('needs_clarification');
    expect(result.questions.length).toBeGreaterThanOrEqual(3);
    expect(result.questions.map((q) => q.id)).toEqual(
      expect.arrayContaining(['audience', 'change-kind', 'existing-shard']),
    );
  });

  it('ignores lockfiles and does not invent missing docs', () => {
    const result = evaluateDocCoverage({
      changedPaths: ['pnpm-lock.yaml', 'package-lock.json'],
    });
    expect(result.status).toBe('covered');
    expect(result.codeChanged).toEqual([]);
  });

  it('advisory exit is always 0; gate fails on non-covered', () => {
    const missing = evaluateDocCoverage({
      changedPaths: ['packages/mdcp-core/src/index.ts'],
      mode: 'advisory',
    });
    expect(docCoverageExitCode(missing)).toBe(0);

    const gated = evaluateDocCoverage({
      changedPaths: ['packages/mdcp-core/src/index.ts'],
      mode: 'gate',
    });
    expect(gated.status).toBe('missing_docs');
    expect(docCoverageExitCode(gated)).toBe(1);

    const covered = evaluateDocCoverage({
      changedPaths: ['docs/glossary/coverage.md'],
      mode: 'gate',
    });
    expect(docCoverageExitCode(covered)).toBe(0);

    const clarify = evaluateDocCoverage({
      changedPaths: ['opaque.xyz'],
      mode: 'gate',
    });
    expect(clarify.status).toBe('needs_clarification');
    expect(docCoverageExitCode(clarify)).toBe(1);
  });

  it('never classifies ambiguous-only as missing_docs', () => {
    const result = evaluateDocCoverage({ changedPaths: ['tmp/foo.dat'] });
    expect(result.status).not.toBe('missing_docs');
    expect(result.status).toBe('needs_clarification');
  });
});
