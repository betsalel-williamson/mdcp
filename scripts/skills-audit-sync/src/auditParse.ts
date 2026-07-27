import { sanitizeBodyText } from './sanitize.js';
import type { AuditFinding } from './types.js';

export function parseSkillsList(payload: unknown): Array<{ slug: string }> {
  if (payload == null || typeof payload !== 'object') {
    return [];
  }

  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (item == null || typeof item !== 'object') {
        return null;
      }
      const slug = (item as { slug?: unknown }).slug;
      return typeof slug === 'string' && slug.length > 0 ? { slug } : null;
    })
    .filter((item): item is { slug: string } => item != null);
}

export function parseAuditFindings(skillSlug: string, payload: unknown): AuditFinding[] {
  if (payload == null || typeof payload !== 'object') {
    return [];
  }

  const audits = (payload as { audits?: unknown }).audits;
  if (!Array.isArray(audits)) {
    return [];
  }

  return audits.map((item) => {
    const audit = item as Record<string, unknown>;
    const providerRaw = audit.slug ?? audit.provider ?? 'unknown';
    return {
      skill: sanitizeBodyText(skillSlug, 100),
      providerSlug: sanitizeBodyText(String(providerRaw).toLowerCase(), 100),
      status: sanitizeBodyText(String(audit.status ?? 'unknown'), 200),
      summary: sanitizeBodyText(String(audit.summary ?? ''), 2000),
      riskLevel: sanitizeBodyText(String(audit.riskLevel ?? audit.risk ?? 'UNKNOWN').toUpperCase(), 100),
      auditedAt: audit.auditedAt != null ? String(audit.auditedAt) : undefined,
    };
  });
}
