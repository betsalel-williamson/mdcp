import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runSync, type SyncDeps } from '../src/run.js';
import { renderInFlightIssueBody } from '../src/github.js';
import { ProxyAuthError } from '../src/proxy.js';

const IN_FLIGHT_BODY = renderInFlightIssueBody({}, []);

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('runSync', () => {
  let acceptedPath: string;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.GITHUB_REPOSITORY = 'betsalel-williamson/mdcp';

    const dir = mkdtempSync(join(tmpdir(), 'skills-audit-sync-'));
    acceptedPath = join(dir, 'accepted.yaml');
    writeFileSync(acceptedPath, 'version: 1\naccepted: []\n');

    fetchMock = vi.fn();
  });

  function githubIssue(number: number, body: string) {
    return { number, title: 'in-flight', body, state: 'open' };
  }

  function baseDeps(overrides: Partial<SyncDeps> = {}): SyncDeps {
    return {
      env: {
        force: false,
        trigger: 'weekly',
        proxyUrl: 'https://proxy.example',
        githubToken: 'gh-token',
        acceptedLogPath: acceptedPath,
      },
      now: new Date('2026-07-18T12:00:00.000Z'),
      fetchFn: fetchMock as unknown as SyncDeps['fetchFn'],
      getOidcToken: async () => 'oidc-token',
      log: () => {},
      ...overrides,
    };
  }

  it('skips when spacing says so', async () => {
    const body = renderInFlightIssueBody({ lastSuccessfulSyncAt: '2026-07-18T06:00:00.000Z' }, []);

    fetchMock.mockImplementation(async (url: string | URL | Request) => {
      const href = String(url);
      if (href.includes('/issues?')) {
        return jsonResponse(200, [githubIssue(1, body)]);
      }
      throw new Error(`Unexpected fetch: ${href}`);
    });

    const result = await runSync(baseDeps());
    expect(result).toMatchObject({ exitCode: 0, skipped: true, reason: 'spacing' });
  });

  it('skips daily trigger without release in 20–28h window', async () => {
    fetchMock.mockImplementation(async (url: string | URL | Request) => {
      const href = String(url);
      if (href.includes('/issues?')) {
        return jsonResponse(200, [githubIssue(1, IN_FLIGHT_BODY)]);
      }
      if (href.includes('/releases')) {
        return jsonResponse(200, [
          { tag_name: 'v1.0.0', published_at: '2026-07-10T12:00:00.000Z' },
        ]);
      }
      throw new Error(`Unexpected fetch: ${href}`);
    });

    const result = await runSync(baseDeps({ env: { ...baseDeps().env, trigger: 'daily' } }));
    expect(result).toMatchObject({ exitCode: 0, skipped: true, reason: 'daily-window' });
  });

  it('fails hard on proxy 401 without updating last sync', async () => {
    fetchMock.mockImplementation(async (url: string | URL | Request) => {
      const href = String(url);
      if (href.includes('/issues?')) {
        return jsonResponse(200, [githubIssue(1, IN_FLIGHT_BODY)]);
      }
      if (href.includes('/releases')) {
        return jsonResponse(200, []);
      }
      if (href.endsWith('/api/skills')) {
        return jsonResponse(401, { error: 'unauthorized' });
      }
      throw new Error(`Unexpected fetch: ${href}`);
    });

    await expect(runSync(baseDeps())).rejects.toBeInstanceOf(ProxyAuthError);
  });

  it('continues on per-skill 404 and records pending skills', async () => {
    let patchedBody = '';

    fetchMock.mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      if (href.includes('/issues?state=open&labels=priority:P1')) {
        return jsonResponse(200, [githubIssue(42, IN_FLIGHT_BODY)]);
      }
      if (href.includes('/releases')) {
        return jsonResponse(200, []);
      }
      if (href.endsWith('/api/skills')) {
        return jsonResponse(200, { data: [{ slug: 'mdcp' }] });
      }
      if (href.endsWith('/api/audit/mdcp')) {
        return jsonResponse(404, { error: 'not_found' });
      }
      if (href.includes('/issues/42') && init?.method === 'PATCH') {
        patchedBody = JSON.parse(String(init.body)).body as string;
        return jsonResponse(200, githubIssue(42, patchedBody));
      }
      throw new Error(`Unexpected fetch: ${href}`);
    });

    const result = await runSync(baseDeps());
    expect(result.exitCode).toBe(0);
    expect(patchedBody).toContain('audits_pending: mdcp');
    expect(patchedBody).toContain('last_successful_sync_at: 2026-07-18T12:00:00.000Z');
  });

  it('classifies a new high finding and opens urgent issue', async () => {
    const comments: string[] = [];
    let urgentCreated = false;

    fetchMock.mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      if (href.includes('/issues?state=open&labels=priority:P1')) {
        return jsonResponse(200, [githubIssue(42, IN_FLIGHT_BODY)]);
      }
      if (href.includes('/issues?state=open&labels=priority:P0')) {
        return jsonResponse(200, []);
      }
      if (href.includes('/releases')) {
        return jsonResponse(200, []);
      }
      if (href.endsWith('/api/skills')) {
        return jsonResponse(200, { data: [{ slug: 'mdcp' }] });
      }
      if (href.endsWith('/api/audit/mdcp')) {
        return jsonResponse(200, {
          audits: [
            { slug: 'snyk', status: 'fail', summary: 'Hardcoded secret', riskLevel: 'HIGH' },
          ],
        });
      }
      if (href.includes('/issues/42/comments')) {
        comments.push(JSON.parse(String(init?.body)).body as string);
        return jsonResponse(201, { id: 1 });
      }
      if (href.endsWith('/issues') && init?.method === 'POST') {
        urgentCreated = true;
        return jsonResponse(201, githubIssue(99, JSON.parse(String(init.body)).body as string));
      }
      if (href.includes('/issues/42') && init?.method === 'PATCH') {
        return jsonResponse(200, githubIssue(42, JSON.parse(String(init.body)).body as string));
      }
      throw new Error(`Unexpected fetch: ${href}`);
    });

    const result = await runSync(baseDeps());
    expect(result.exitCode).toBe(0);
    expect(urgentCreated).toBe(true);
    expect(comments.some((body) => body.includes('New audit finding'))).toBe(true);
  });
});

describe('readSyncEnv accepted log default', () => {
  it('loads committed scaffold shape', () => {
    const scaffold = readFileSync(
      join(process.cwd(), '../../security/skills-audit-accepted.yaml'),
      'utf8',
    );
    expect(scaffold).toContain('version: 1');
  });
});
