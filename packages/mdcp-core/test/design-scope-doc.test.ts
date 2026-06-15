import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(import.meta.dirname, '../../..');

function readRepoDoc(...segments: string[]): string {
  return readFileSync(join(repoRoot, ...segments), 'utf8');
}

describe('design scope documentation (#26)', () => {
  const designConstraints = readRepoDoc('docs/features/design-constraints.md');
  const featureCatalog = readRepoDoc('docs/features/feature-catalog.md');
  const compileHooks = readRepoDoc('docs/client-core/compile-hooks/index.md');

  it('documents preprocessor and templating as out of scope', () => {
    expect(designConstraints).toMatch(/## Preprocessor \/ templating \(out of scope\)/);
    expect(designConstraints).toContain(
      'preprocess (optional) → mdcp compile / check → postprocess (optional)',
    );
    expect(designConstraints).toContain('{{variable}}');
    expect(designConstraints).toContain('Handlebars');
    expect(designConstraints).toContain('inlineInserts');
    expect(designConstraints).toContain('Not the same as compile hooks');
  });

  it('cross-links compile hooks from the feature catalog', () => {
    expect(featureCatalog).toContain('not a general preprocessor or template engine');
    expect(featureCatalog).toContain(
      './design-constraints.md#preprocessor--templating-out-of-scope',
    );
    expect(featureCatalog).toContain('No preprocessor / templating');
  });

  it('clarifies compile hooks are not a template engine', () => {
    expect(compileHooks).toContain('Not general templating');
    expect(compileHooks).toContain('{{variables}}');
    expect(compileHooks).toContain(
      '../../features/design-constraints.md#preprocessor--templating-out-of-scope',
    );
  });
});
