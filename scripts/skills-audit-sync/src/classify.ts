import { fingerprint } from './fingerprint.js';
import { triageFinding } from './triage.js';
import type { AuditFinding, FindingClassification } from './types.js';

export function classifyFinding(
  finding: AuditFinding,
  acceptedFingerprints: ReadonlySet<string>,
  inFlightFingerprints: ReadonlySet<string>,
): FindingClassification {
  const fp = fingerprint(finding);

  if (acceptedFingerprints.has(fp)) {
    return { kind: 'accepted' };
  }

  if (inFlightFingerprints.has(fp)) {
    return { kind: 'in_flight' };
  }

  return { kind: 'new', triage: triageFinding(finding) };
}
