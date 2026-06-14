import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { applyCompileHooks } from '../src/compile/hooks.js';
import '../src/compile/hooks/builtin.js';

const baseCtx = {
  guideName: 'review',
  filename: 'claim.md',
  config: {
    guides: [
      {
        name: 'glossary',
        compile: {
          hooksConfig: { reviewLinks: { targetMonolith: 'architecture-review.md' } },
        },
      },
    ],
  } as never,
};

describe('builtin compile hooks', () => {
  const work = join(tmpdir(), `mdcp-hooks-${Date.now()}`);

  it('codeEvidence adds line fragments from link text', () => {
    const out = applyCompileHooks(
      'See [firestore.rules L6-L8](firestore.rules) for rules.',
      { ...baseCtx, sourceFile: '/tmp/claim.md' },
      ['codeEvidence'],
    );
    expect(out).toContain('](firestore.rules#L6-L8)');
  });

  it('codeEvidence resolves symbol fragments when file exists', () => {
    mkdirSync(work, { recursive: true });
    const guideDir = join(work, 'review');
    mkdirSync(guideDir, { recursive: true });
    writeFileSync(join(guideDir, 'util.ts'), 'export function helper() {\n  return 1;\n}\n');
    const sourceFile = join(guideDir, 'claim.md');
    const prev = process.cwd();
    process.chdir(work);
    try {
      const out = applyCompileHooks(
        'Evidence: [helper](util.ts#helper)',
        { ...baseCtx, sourceFile },
        ['codeEvidence'],
      );
      expect(out).toMatch(/util\.ts#L\d+\)/);
    } finally {
      process.chdir(prev);
      rmSync(work, { recursive: true, force: true });
    }
  });

  it('inlineDiagrams expands diagram directive', () => {
    mkdirSync(work, { recursive: true });
    const guideDir = join(work, 'review');
    mkdirSync(guideDir, { recursive: true });
    mkdirSync(join(guideDir, 'diagrams'), { recursive: true });
    writeFileSync(join(guideDir, 'diagrams', 'flow.md'), '| A | B |\n|---|---|\n| 1 | 2 |\n');
    const sourceFile = join(guideDir, 'claim.md');
    const out = applyCompileHooks(
      'Intro\n\n<!-- mdcp:diagram diagrams/flow.md -->\n',
      { ...baseCtx, sourceFile },
      ['inlineDiagrams'],
    );
    expect(out).toContain('| A | B |');
    rmSync(work, { recursive: true, force: true });
  });

  it('reviewLinks rewrites FIND shard links to monolith anchors', () => {
    mkdirSync(work, { recursive: true });
    const outcomes = join(work, 'review', 'outcomes');
    mkdirSync(outcomes, { recursive: true });
    writeFileSync(join(outcomes, 'FIND-004.md'), '# FIND-004 — Example finding\n');
    const sourceFile = join(work, 'glossary', 'terms.md');
    mkdirSync(join(work, 'glossary'), { recursive: true });
    const prev = process.cwd();
    process.chdir(work);
    try {
      const out = applyCompileHooks(
        'See [FIND-004](../review/outcomes/FIND-004.md).',
        {
          guideName: 'glossary',
          filename: 'terms.md',
          config: baseCtx.config,
          sourceFile,
        },
        ['reviewLinks'],
      );
      expect(out).toContain('](architecture-review.md#find-004');
    } finally {
      process.chdir(prev);
      rmSync(work, { recursive: true, force: true });
    }
  });
});
