import { describe, it, expect } from 'vitest';
import { DEFAULT_LOCALE_ID, enUS, getLocalePack, listLocalePackIds } from '../src/locale/index.js';
import { formatBrokenLinkMarker } from '../src/links/mark-broken.js';
import { numberedInsertHeading } from '../src/compile/hooks/inline-inserts.js';
import { buildSlugRegistry } from '../src/refs/slugs.js';

describe('locale packs', () => {
  it('defaults to en-US and lists registered packs', () => {
    expect(DEFAULT_LOCALE_ID).toBe('en-US');
    expect(listLocalePackIds()).toEqual(['en-US']);
    expect(getLocalePack()).toBe(enUS);
    expect(getLocalePack('en-US').id).toBe('en-US');
  });

  it('rejects unknown locale ids', () => {
    expect(() => getLocalePack('fr-FR')).toThrow(/Unknown locale pack/);
  });

  it('keeps chapter semantic keys in the en-US pack for refs', () => {
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
});
