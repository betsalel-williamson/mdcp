import { describe, it, expect } from 'vitest';
import {
  demoteHeadings,
  demoteExceptFirstH1,
  stripAboutThisGuideHeading,
  extractGuideH1,
} from '../src/compile/headings.js';

describe('demoteHeadings', () => {
  it('demotes ATX headings by one level', () => {
    const input = '# One\n## Two\n### Three';
    expect(demoteHeadings(input)).toBe('## One\n### Two\n#### Three');
  });

  it('does not demote h6 further', () => {
    expect(demoteHeadings('###### Max')).toBe('###### Max');
  });

  it('ignores headings inside fenced code', () => {
    const input = '# Real\n\n```md\n# Fake\n```\n';
    const out = demoteHeadings(input);
    expect(out).toContain('## Real');
    expect(out).toContain('# Fake');
  });
});

describe('demoteExceptFirstH1', () => {
  it('keeps first h1 and demotes the rest', () => {
    const input = '# Keep\n## Two\n# Also demoted';
    const out = demoteExceptFirstH1(input);
    expect(out).toMatch(/^# Keep/m);
    expect(out).toContain('### Two');
    expect(out).toContain('## Also demoted');
  });

  it('preserves headings inside fenced code', () => {
    const input = '# Keep\n\n```md\n# Fake\n```\n\n## After';
    const out = demoteExceptFirstH1(input);
    expect(out).toMatch(/^# Keep/m);
    expect(out).toContain('# Fake');
    expect(out).toContain('### After');
  });
});

describe('stripAboutThisGuideHeading', () => {
  it('removes about-this-guide h1 and leading blanks', () => {
    const input = '# About this guide\n\nBody text.\n';
    expect(stripAboutThisGuideHeading(input)).toBe('Body text.\n\n');
  });

  it('returns empty string when only the about heading remains', () => {
    expect(stripAboutThisGuideHeading('# About this guide\n\n')).toBe('');
  });
});

describe('extractGuideH1', () => {
  it('returns first h1 from index', () => {
    const index = '# My Guide\n\n- [a](a.md)\n';
    expect(extractGuideH1(index)).toBe('# My Guide\n\n');
  });

  it('returns null when no h1 is present', () => {
    expect(extractGuideH1('## Only h2\n')).toBeNull();
  });
});
