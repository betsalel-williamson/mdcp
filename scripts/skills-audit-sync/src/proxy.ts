import { OIDC_AUDIENCE } from './config.js';
import type { FetchFn } from './github.js';

export interface ProxyResponse {
  status: number;
  body: unknown;
  headers: Headers;
}

export interface ProxyDeps {
  baseUrl: string;
  fetchFn?: FetchFn;
  getOidcToken?: () => Promise<string>;
}

export class ProxyAuthError extends Error {
  constructor(status: number) {
    super(`Proxy auth failed (${status})`);
    this.name = 'ProxyAuthError';
  }
}

export async function getActionsOidcToken(
  audience: string = OIDC_AUDIENCE,
  fetchFn: FetchFn = fetch,
): Promise<string> {
  const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!requestUrl || !requestToken) {
    throw new Error('Missing ACTIONS_ID_TOKEN_REQUEST_URL or ACTIONS_ID_TOKEN_REQUEST_TOKEN');
  }

  const url = new URL(requestUrl);
  url.searchParams.set('audience', audience);

  const response = await fetchFn(url.toString(), {
    headers: { Authorization: `Bearer ${requestToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to request GitHub Actions OIDC token (${response.status})`);
  }

  const payload = (await response.json()) as { value?: string };
  if (!payload.value) {
    throw new Error('GitHub Actions OIDC token response missing value');
  }

  return payload.value;
}

async function proxyFetch(deps: ProxyDeps, path: string, token: string): Promise<ProxyResponse> {
  const fetchFn = deps.fetchFn ?? fetch;
  const base = deps.baseUrl.replace(/\/$/, '');
  const response = await fetchFn(`${base}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { error: 'invalid_json', message: text };
    }
  }

  return { status: response.status, body, headers: response.headers };
}

export async function fetchSkillsFromProxy(deps: ProxyDeps, token: string): Promise<ProxyResponse> {
  return proxyFetch(deps, '/api/skills', token);
}

export async function fetchAuditFromProxy(
  deps: ProxyDeps,
  skillSlug: string,
  token: string,
): Promise<ProxyResponse> {
  const encoded = encodeURIComponent(skillSlug);
  return proxyFetch(deps, `/api/audit/${encoded}`, token);
}

export async function getProxyOidcToken(deps: ProxyDeps): Promise<string> {
  const getToken = deps.getOidcToken ?? getActionsOidcToken;
  return getToken(OIDC_AUDIENCE);
}

export function assertProxyAuthorized(response: ProxyResponse): void {
  if (response.status === 401 || response.status === 403) {
    throw new ProxyAuthError(response.status);
  }
}
