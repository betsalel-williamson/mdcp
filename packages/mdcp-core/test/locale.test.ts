import { describe, it, expect } from 'vitest';
import { DEFAULT_LOCALE_ID, enUS, getLocalePack, listLocalePackIds } from '../src/locale/index.js';
import { formatBrokenLinkMarker } from '../src/links/mark-broken.js';
import { numberedInsertHeading } from '../src/compile/hooks/inline-inserts.js';
import { buildSlugRegistry } from '../src/refs/slugs.js';
import { lintXrefs } from '../src/xrefs/lint.js';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { useTmpDir } from './helpers/tmp-dir.js';

describe('locale packs', () => {
  const work = useTmpDir('mdcp-locale-xrefs-');

  it('defaults to en-US and lists registered packs', () => {
    expect(DEFAULT_LOCALE_ID).toBe('en-US');
    expect(listLocalePackIds()).toEqual(['en-US']);
    expect(getLocalePack()).toBe(enUS);
    expect(getLocalePack('en-US').id).toBe('en-US');
  });

  it('rejects unknown locale ids', () => {
    expect(() => getLocalePack('fr-FR')).toThrow(/Unknown locale pack/);
  });

  it('keeps US-English xref cues in the en-US pack, not GFM helpers', () => {
    expect(enUS.xrefs.seeTableCell).toBe('| See |');
    expect(enUS.xrefs.unlinkedSeeCapitalMessage).toMatch(/See/);
    expect(enUS.chapterKeyFromTitle('ADM Chapter 1 — Start')).toEqual({
      prefix: 'ADM',
      number: '1',
    });
    expect(enUS.chapterKeyFromTitle('Introduction')).toBeNull();
  });

  it('formats broken-link markers from the active locale pack', () => {
    const marker = formatBrokenLinkMarker('T', './a.md', '#x', enUS.brokenLinks.reasonDeadAnchor);
    expect(marker).toContain('**BROKEN LINK:**');
    expect(marker).toContain(enUS.brokenLinks.reasonDeadAnchor);
    expect(enUS.brokenLinks.lineHasMarker(marker)).toBe(true);
  });

  it('builds insert captions via en-US kind titles', () => {
    expect(numberedInsertHeading('/docs/tables/status-codes.md', '', 1)).toBe(
      'Table 1. Status Codes',
    );
    expect(enUS.inserts.seeInsertFallback).toBe('See insert');
  });

  it('wires chapter semantic keys through the locale pack', () => {
    const reg = buildSlugRegistry('# Guide\n\n## ADM Chapter 1 — Getting started\n');
    const entry = reg.headings.find((h) => h.title.includes('ADM Chapter 1'));
    expect(entry?.key).toBe('adm.ch1');
  });

  it('lintXrefs uses locale pack patterns', () => {
    writeFileSync(join(work.path, 'bad.md'), 'See Section 2 for details.\n');
    const issues = lintXrefs([work.path], enUS);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatch(/unlinked See reference|bare cross-ref/i);
  });
});
