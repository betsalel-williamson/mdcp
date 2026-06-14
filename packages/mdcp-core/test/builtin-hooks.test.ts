import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { applyCompileHooks } from '../src/compile/hooks.js';
import '../src/compile/hooks/builtin.js';
import { useTmpDir, withCwd } from './helpers/tmp-dir.js';

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
  const work = useTmpDir('mdcp-hooks-');

  it('codeEvidence adds line fragments from link text', () => {
    const out = applyCompileHooks(
      'See [firestore.rules L6-L8](firestore.rules) for rules.',
      { ...baseCtx, sourceFile: '/tmp/claim.md' },
      ['codeEvidence'],
    );
    expect(out).toContain('](firestore.rules#L6-L8)');
  });

  it('codeEvidence resolves symbol fragments when file exists', () => {
    const guideDir = join(work.path, 'review');
    mkdirSync(guideDir, { recursive: true });
    writeFileSync(join(guideDir, 'util.ts'), 'export function helper() {\n  return 1;\n}\n');
    const sourceFile = join(guideDir, 'claim.md');
    withCwd(work.path, () => {
      const out = applyCompileHooks(
        'Evidence: [helper](util.ts#helper)',
        { ...baseCtx, sourceFile },
        ['codeEvidence'],
      );
      expect(out).toMatch(/util\.ts#L\d+\)/);
    });
  });

  it('inlineDiagrams expands diagram directive', () => {
    const guideDir = join(work.path, 'review');
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
  });

  it('reviewLinks rewrites FIND shard links to monolith anchors', () => {
    const outcomes = join(work.path, 'review', 'outcomes');
    mkdirSync(outcomes, { recursive: true });
    writeFileSync(join(outcomes, 'FIND-004.md'), '# FIND-004 — Example finding\n');
    const sourceFile = join(work.path, 'glossary', 'terms.md');
    mkdirSync(join(work.path, 'glossary'), { recursive: true });
    withCwd(work.path, () => {
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
    });
  });
});
