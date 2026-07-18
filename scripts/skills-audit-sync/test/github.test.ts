import { describe, it, expect } from 'vitest';
import { parseAuditFindings, parseSkillsList } from '../src/auditParse.js';
import {
  formatChangeComment,
  hasBodyMarker,
  hasReleaseInDailyWindow,
  parseInFlightEntries,
  parseIssueMeta,
  parseLastSuccessfulSyncAt,
  renderInFlightIssueBody,
  setLastSuccessfulSyncAt,
  urgentIssueMarker,
  urgentIssueTitle,
} from '../src/github.js';
import { BODY_MARKER } from '../src/config.js';

describe('parseIssueMeta', () => {
  it('reads last_successful_sync_at and audits_pending', () => {
    const body = `<!-- skills-audit-meta
last_successful_sync_at: 2026-07-18T12:00:00.000Z
audits_pending: mdcp,mdcp-doc-only
-->`;

    expect(parseIssueMeta(body)).toEqual({
      lastSuccessfulSyncAt: '2026-07-18T12:00:00.000Z',
      auditsPending: ['mdcp', 'mdcp-doc-only'],
    });
  });
});

describe('parseInFlightEntries', () => {
  it('parses JSON register block', () => {
    const body = `<!-- skills-audit-in-flight
[{"fingerprint":"fp1","skill":"mdcp","providerSlug":"snyk","status":"fail","summary":"x","riskLevel":"HIGH","triage":"high","lastSeen":"2026-07-18T12:00:00.000Z"}]
-->`;

    expect(parseInFlightEntries(body)).toHaveLength(1);
    expect(parseInFlightEntries(body)[0]?.fingerprint).toBe('fp1');
  });
});

describe('renderInFlightIssueBody', () => {
  it('includes marker and meta blocks', () => {
    const body = renderInFlightIssueBody(
      { lastSuccessfulSyncAt: '2026-07-18T12:00:00.000Z', auditsPending: ['mdcp'] },
      [],
    );

    expect(hasBodyMarker(body)).toBe(true);
    expect(parseLastSuccessfulSyncAt(body)).toBe('2026-07-18T12:00:00.000Z');
    expect(parseInFlightEntries(body)).toEqual([]);
  });
});

describe('setLastSuccessfulSyncAt', () => {
  it('updates meta while preserving entries', () => {
    const original = renderInFlightIssueBody({}, [
      {
        fingerprint: 'fp1',
        skill: 'mdcp',
        providerSlug: 'snyk',
        status: 'fail',
        summary: 'x',
        riskLevel: 'HIGH',
        triage: 'high',
        lastSeen: '2026-07-17T12:00:00.000Z',
      },
    ]);

    const updated = setLastSuccessfulSyncAt(original, '2026-07-18T12:00:00.000Z');
    expect(parseLastSuccessfulSyncAt(updated)).toBe('2026-07-18T12:00:00.000Z');
    expect(parseInFlightEntries(updated)).toHaveLength(1);
  });
});

describe('hasReleaseInDailyWindow', () => {
  const now = Date.parse('2026-07-18T12:00:00.000Z');

  it('returns true when a v* release is 24h old', () => {
    expect(
      hasReleaseInDailyWindow(
        [{ tag_name: 'v1.2.3', published_at: '2026-07-17T12:00:00.000Z' }],
        now,
      ),
    ).toBe(true);
  });

  it('ignores non-v tags and out-of-window releases', () => {
    expect(
      hasReleaseInDailyWindow(
        [
          { tag_name: 'nightly', published_at: '2026-07-17T12:00:00.000Z' },
          { tag_name: 'v1.0.0', published_at: '2026-07-10T12:00:00.000Z' },
        ],
        now,
      ),
    ).toBe(false);
  });
});

describe('formatChangeComment', () => {
  it('includes skills.sh link for new findings', () => {
    const comment = formatChangeComment(
      'new',
      {
        skill: 'mdcp',
        providerSlug: 'snyk',
        status: 'fail',
        summary: 'Hardcoded secret',
        riskLevel: 'HIGH',
      },
      'high',
    );

    expect(comment).toContain('https://skills.sh/betsalel-williamson/mdcp/mdcp');
    expect(comment).toContain('**high**');
  });
});

describe('urgent issue helpers', () => {
  it('builds stable marker and title', () => {
    const fp = '{"skill":"mdcp"}';
    expect(urgentIssueMarker(fp)).toContain(fp);
    expect(
      urgentIssueTitle({
        skill: 'mdcp',
        providerSlug: 'snyk',
        status: 'fail',
        summary: 'Hardcoded secret',
        riskLevel: 'HIGH',
      }),
    ).toContain('[skill-security] HIGH');
  });
});

describe('auditParse', () => {
  it('parses skills list and audit payloads', () => {
    expect(
      parseSkillsList({
        data: [{ slug: 'mdcp' }, { slug: 'mdcp-doc-only' }],
      }),
    ).toEqual([{ slug: 'mdcp' }, { slug: 'mdcp-doc-only' }]);

    expect(
      parseAuditFindings('mdcp', {
        audits: [{ slug: 'snyk', status: 'fail', summary: 'x', riskLevel: 'HIGH' }],
      }),
    ).toEqual([
      {
        skill: 'mdcp',
        providerSlug: 'snyk',
        status: 'fail',
        summary: 'x',
        riskLevel: 'HIGH',
        auditedAt: undefined,
      },
    ]);
  });
});

describe('BODY_MARKER', () => {
  it('matches ADR marker', () => {
    expect(BODY_MARKER).toBe('<!-- skill-security-audit: betsalel-williamson/mdcp -->');
  });
});
