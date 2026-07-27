import { describe, it, expect } from 'vitest';
import { fingerprint } from '../src/fingerprint.js';

describe('fingerprint', () => {
  const base = {
    skill: 'mdcp',
    providerSlug: 'snyk',
    status: 'fail',
    summary: 'Hardcoded secret in SKILL.md',
    riskLevel: 'HIGH',
  };

  it('returns a stable string from identity fields', () => {
    const fp = fingerprint(base);
    expect(typeof fp).toBe('string');
    expect(fp.length).toBeGreaterThan(0);
    expect(fingerprint(base)).toBe(fp);
  });

  it('ignores auditedAt churn', () => {
    const withDate = { ...base, auditedAt: '2026-07-18T12:00:00Z' };
    const withNewDate = { ...base, auditedAt: '2026-07-19T08:00:00Z' };
    expect(fingerprint(withDate)).toBe(fingerprint(withNewDate));
    expect(fingerprint(withDate)).toBe(fingerprint(base));
  });

  it('changes when any identity field changes', () => {
    const original = fingerprint(base);
    expect(fingerprint({ ...base, skill: 'mdcp-doc-only' })).not.toBe(original);
    expect(fingerprint({ ...base, providerSlug: 'socket' })).not.toBe(original);
    expect(fingerprint({ ...base, status: 'warn' })).not.toBe(original);
    expect(fingerprint({ ...base, summary: 'Different summary' })).not.toBe(original);
    expect(fingerprint({ ...base, riskLevel: 'MEDIUM' })).not.toBe(original);
  });
});
