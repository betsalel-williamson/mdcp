import { describe, it, expect } from 'vitest';
import { classifyFinding } from '../src/classify.js';
import { fingerprint } from '../src/fingerprint.js';

const finding = {
  skill: 'mdcp',
  providerSlug: 'snyk',
  status: 'fail',
  summary: 'Hardcoded secret',
  riskLevel: 'HIGH',
};

describe('classifyFinding', () => {
  const fp = fingerprint(finding);
  const accepted = new Set([fp]);
  const inFlight = new Set(['other-fingerprint']);

  it('returns accepted when fingerprint is in the accepted log', () => {
    expect(classifyFinding(finding, accepted, inFlight)).toEqual({ kind: 'accepted' });
  });

  it('returns in_flight when fingerprint is on the in-flight register', () => {
    expect(classifyFinding(finding, new Set(), new Set([fp]))).toEqual({ kind: 'in_flight' });
  });

  it('prefers accepted over in_flight', () => {
    expect(classifyFinding(finding, accepted, new Set([fp]))).toEqual({ kind: 'accepted' });
  });

  it('returns new with triage for unseen findings', () => {
    expect(classifyFinding(finding, new Set(), new Set())).toEqual({
      kind: 'new',
      triage: 'high',
    });
  });

  it('returns new with null triage for unseen pass findings', () => {
    const passFinding = { ...finding, status: 'pass', riskLevel: 'LOW' };
    expect(classifyFinding(passFinding, new Set(), new Set())).toEqual({
      kind: 'new',
      triage: null,
    });
  });
});
