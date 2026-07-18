import type { TriageLevel } from './types.js';

export function triageFinding(finding: { status: string; riskLevel: string }): TriageLevel | null {
  const status = finding.status.toLowerCase();
  const riskLevel = finding.riskLevel.toUpperCase();

  if (status === 'pass') {
    return null;
  }

  if (status === 'fail' || riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
    return 'high';
  }

  if (status === 'warn' || riskLevel === 'MEDIUM') {
    return 'medium';
  }

  return 'low';
}
