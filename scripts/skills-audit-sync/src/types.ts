export interface AuditFindingIdentity {
  skill: string;
  providerSlug: string;
  status: string;
  summary: string;
  riskLevel: string;
}

export type AuditFinding = AuditFindingIdentity & {
  auditedAt?: string;
};

export type TriageLevel = 'high' | 'medium' | 'low';

export type FindingClassification =
  { kind: 'accepted' } | { kind: 'in_flight' } | { kind: 'new'; triage: TriageLevel | null };

export interface AcceptedLogEntry {
  fingerprint: string;
  source: string;
  risk: string;
  date: string;
  reason: string;
  accepter: string;
}

export interface AcceptedLog {
  version: number;
  accepted: AcceptedLogEntry[];
}
