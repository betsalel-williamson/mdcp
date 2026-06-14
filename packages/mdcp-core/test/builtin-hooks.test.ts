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
