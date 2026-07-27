import { getVercelOidcToken } from '@vercel/oidc';
import { SKILLS_SH_BASE, SKILLS_SOURCE } from './config.js';

export type SkillsShDeps = {
  fetchFn?: typeof fetch;
  getToken?: () => Promise<string>;
};

export type ProxyPayload = {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
};

const SKILLS_OWNER = SKILLS_SOURCE.split('/')[0] ?? SKILLS_SOURCE;
const SKILLS_REPO = SKILLS_SOURCE.split('/').slice(1).join('/') || 'mdcp';

type SearchResponse = {
  data?: Array<{ source?: string }>;
  count?: number;
  [key: string]: unknown;
};

function upstreamHeaders(response: Response): Record<string, string> | undefined {
  const retryAfter = response.headers.get('Retry-After');
  if (!retryAfter) {
    return undefined;
  }
  return { 'Retry-After': retryAfter };
}

async function readUpstreamResponse(response: Response): Promise<ProxyPayload> {
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { error: 'upstream_error', message: 'Invalid JSON from skills.sh' };
    }
  }

  return {
    status: response.status,
    body,
    headers: upstreamHeaders(response),
  };
}

async function skillsShFetch(path: string, deps: SkillsShDeps = {}): Promise<Response> {
  const fetchFn = deps.fetchFn ?? fetch;
  const getToken = deps.getToken ?? getVercelOidcToken;
  const token = await getToken();

  return fetchFn(`${SKILLS_SH_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function listMdcpSkills(deps: SkillsShDeps = {}): Promise<ProxyPayload> {
  const params = new URLSearchParams({
    owner: SKILLS_OWNER,
    q: SKILLS_REPO,
    limit: '200',
  });
  const response = await skillsShFetch(`/api/v1/skills/search?${params.toString()}`, deps);

  if (!response.ok) {
    return readUpstreamResponse(response);
  }

  const payload = (await response.json()) as SearchResponse;
  const data = (payload.data ?? []).filter((skill) => skill.source === SKILLS_SOURCE);

  return {
    status: response.status,
    body: {
      ...payload,
      data,
      count: data.length,
    },
    headers: upstreamHeaders(response),
  };
}

export async function fetchSkillAudit(
  skill: string,
  deps: SkillsShDeps = {},
): Promise<ProxyPayload> {
  const encodedSkill = encodeURIComponent(skill);
  const response = await skillsShFetch(
    `/api/v1/skills/audit/${SKILLS_SOURCE}/${encodedSkill}`,
    deps,
  );
  return readUpstreamResponse(response);
}
