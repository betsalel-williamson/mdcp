import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkOrphans } from '../src/validate/orphans.js';
import { buildSlugRegistry } from '../src/refs/slugs.js';
import { compileGuides } from '../src/compile/assemble.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, '../../../examples/sample-guides');

describe('checkOrphans', () => {
  it('reports no orphans for sample fixture', () => {
    const issues = checkOrphans(FIXTURE, ['overview', 'admin-guide', 'developer-guide']);
    expect(issues).toEqual([]);
  });
});

describe('buildSlugRegistry', () => {
  it('generates slugs from compiled output', () => {
    const compiled = compileGuides({
      guidesRoot: FIXTURE,
      compileOrder: ['admin-guide'],
    });
    const registry = buildSlugRegistry(compiled);
    expect(registry.headings.length).toBeGreaterThan(0);
    expect(registry.headings.some((h) => h.slug.includes('admin-chapter'))).toBe(true);
  });
});
