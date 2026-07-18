import type { AuditFinding } from './types.js';

/** Stable finding identity; ignores lone `auditedAt` churn. */
export function fingerprint(finding: AuditFinding): string {
  const { skill, providerSlug, status, summary, riskLevel } = finding;
  return JSON.stringify({ skill, providerSlug, status, summary, riskLevel });
}
