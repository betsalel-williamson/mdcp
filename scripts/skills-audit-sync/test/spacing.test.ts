import { describe, it, expect } from 'vitest';
import { DEFAULT_MIN_INTERVAL_MS, shouldSkipScheduledSync } from '../src/spacing.js';

describe('shouldSkipScheduledSync', () => {
  const now = new Date('2026-07-18T12:00:00Z');

  it('does not skip when there is no prior successful sync', () => {
    expect(shouldSkipScheduledSync(null, now)).toBe(false);
    expect(shouldSkipScheduledSync(undefined, now)).toBe(false);
  });

  it('skips when last sync is within the default 24h window', () => {
    const last = new Date('2026-07-18T06:00:00Z');
    expect(shouldSkipScheduledSync(last, now)).toBe(true);
    expect(shouldSkipScheduledSync(last.toISOString(), now)).toBe(true);
  });

  it('does not skip when last sync is older than the interval', () => {
    const last = new Date('2026-07-17T11:00:00Z');
    expect(shouldSkipScheduledSync(last, now)).toBe(false);
  });

  it('respects a custom minIntervalMs', () => {
    const last = new Date('2026-07-18T11:30:00Z');
    expect(shouldSkipScheduledSync(last, now, 60 * 60 * 1000)).toBe(true);
    expect(shouldSkipScheduledSync(last, now, 15 * 60 * 1000)).toBe(false);
  });

  it('exports a 24h default interval', () => {
    expect(DEFAULT_MIN_INTERVAL_MS).toBe(24 * 60 * 60 * 1000);
  });
});
