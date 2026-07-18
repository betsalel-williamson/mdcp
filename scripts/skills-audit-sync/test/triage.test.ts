import { describe, it, expect } from 'vitest';
import { triageFinding } from '../src/triage.js';

describe('triageFinding', () => {
  it('returns null for pass', () => {
    expect(triageFinding({ status: 'pass', riskLevel: 'LOW' })).toBeNull();
    expect(triageFinding({ status: 'PASS', riskLevel: 'HIGH' })).toBeNull();
  });

  it('returns high for fail or HIGH/CRITICAL risk', () => {
    expect(triageFinding({ status: 'fail', riskLevel: 'LOW' })).toBe('high');
    expect(triageFinding({ status: 'warn', riskLevel: 'HIGH' })).toBe('high');
    expect(triageFinding({ status: 'warn', riskLevel: 'CRITICAL' })).toBe('high');
  });

  it('returns medium for warn or MEDIUM risk (when not already high)', () => {
    expect(triageFinding({ status: 'warn', riskLevel: 'LOW' })).toBe('medium');
    expect(triageFinding({ status: 'info', riskLevel: 'MEDIUM' })).toBe('medium');
  });

  it('returns low for other non-pass findings', () => {
    expect(triageFinding({ status: 'info', riskLevel: 'LOW' })).toBe('low');
    expect(triageFinding({ status: 'unknown', riskLevel: 'UNKNOWN' })).toBe('low');
  });
});
