import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSkillAudit, listMdcpSkills } from '../src/skillsSh.js';
import { SKILLS_SH_BASE, SKILLS_SOURCE } from '../src/config.js';

const mockGetToken = vi.fn(async () => 'vercel-oidc-token');

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('listMdcpSkills', () => {
  beforeEach(() => {
    mockGetToken.mockClear();
  });

  it('searches by owner and filters to SKILLS_SOURCE', async () => {
    const fetchFn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe(
        `${SKILLS_SH_BASE}/api/v1/skills/search?owner=betsalel-williamson&q=mdcp&limit=200`,
      );
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer vercel-oidc-token',
      });
      return jsonResponse(200, {
        data: [
          { id: `${SKILLS_SOURCE}/mdcp`, slug: 'mdcp', source: SKILLS_SOURCE },
          { id: 'other/repo/skill', slug: 'skill', source: 'other/repo' },
        ],
        query: 'mdcp',
        count: 2,
      });
    });

    const result = await listMdcpSkills({ fetchFn, getToken: mockGetToken });

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      data: [{ id: `${SKILLS_SOURCE}/mdcp`, slug: 'mdcp', source: SKILLS_SOURCE }],
      count: 1,
    });
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(mockGetToken).toHaveBeenCalledOnce();
  });

  it('propagates 429 with Retry-After', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse(
        429,
        { error: 'rate_limit', message: 'Too many requests' },
        {
          'Retry-After': '30',
        },
      ),
    );

    const result = await listMdcpSkills({ fetchFn, getToken: mockGetToken });

    expect(result.status).toBe(429);
    expect(result.headers?.['Retry-After']).toBe('30');
    expect(result.body).toMatchObject({ error: 'rate_limit' });
  });

  it('propagates 503', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse(503, { error: 'unavailable', message: 'Try again later' }),
    );

    const result = await listMdcpSkills({ fetchFn, getToken: mockGetToken });

    expect(result.status).toBe(503);
    expect(result.body).toMatchObject({ error: 'unavailable' });
  });
});

describe('fetchSkillAudit', () => {
  beforeEach(() => {
    mockGetToken.mockClear();
  });

  it('calls the audit endpoint for the skill slug', async () => {
    const auditPayload = {
      id: `${SKILLS_SOURCE}/mdcp`,
      source: SKILLS_SOURCE,
      slug: 'mdcp',
      audits: [{ provider: 'Snyk', slug: 'snyk', status: 'pass', summary: 'OK' }],
    };
    const fetchFn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe(`${SKILLS_SH_BASE}/api/v1/skills/audit/${SKILLS_SOURCE}/mdcp`);
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer vercel-oidc-token',
      });
      return jsonResponse(200, auditPayload);
    });

    const result = await fetchSkillAudit('mdcp', { fetchFn, getToken: mockGetToken });

    expect(result.status).toBe(200);
    expect(result.body).toEqual(auditPayload);
  });

  it('propagates 404', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse(404, { error: 'not_found', message: 'No audits yet' }),
    );

    const result = await fetchSkillAudit('missing-skill', { fetchFn, getToken: mockGetToken });

    expect(result.status).toBe(404);
    expect(result.body).toMatchObject({ error: 'not_found' });
  });

  it('propagates 429 with Retry-After', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse(429, { error: 'rate_limit', message: 'Slow down' }, { 'Retry-After': '60' }),
    );

    const result = await fetchSkillAudit('mdcp', { fetchFn, getToken: mockGetToken });

    expect(result.status).toBe(429);
    expect(result.headers?.['Retry-After']).toBe('60');
  });
});
