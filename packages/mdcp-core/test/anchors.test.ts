import { describe, it, expect } from 'vitest';
import { stripExplicitAnchorMarkers } from '../src/compile/anchors.js';

describe('stripExplicitAnchorMarkers', () => {
  it('removes brace ids from headings', () => {
    const out = stripExplicitAnchorMarkers('## Architecture review {#review-index}\n');
    expect(out).toBe('## Architecture review\n');
  });
});
