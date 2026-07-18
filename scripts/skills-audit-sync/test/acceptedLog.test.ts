import { describe, it, expect } from 'vitest';
import { loadAcceptedFingerprints } from '../src/acceptedLog.js';

describe('loadAcceptedFingerprints', () => {
  it('loads fingerprints from accepted log YAML', () => {
    const yaml = `
version: 1
accepted:
  - fingerprint: fp-one
    source: skills.sh/snyk/mdcp
    risk: Hardcoded secret
    date: 2026-07-01
    reason: False positive
    accepter: maintainer@example.com
  - fingerprint: fp-two
    source: skills.sh/socket/mdcp
    risk: Outdated dependency note
    date: 2026-07-02
    reason: Tracked separately
    accepter: other@example.com
`;
    const fps = loadAcceptedFingerprints(yaml);
    expect(fps).toEqual(new Set(['fp-one', 'fp-two']));
  });

  it('returns an empty set for an empty accepted list', () => {
    expect(loadAcceptedFingerprints('version: 1\naccepted: []\n')).toEqual(new Set());
  });

  it('throws on invalid YAML shape', () => {
    expect(() => loadAcceptedFingerprints('accepted: not-a-list')).toThrow(/accepted/i);
  });
});
