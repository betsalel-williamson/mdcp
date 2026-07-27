import {
  BODY_MARKER,
  IN_FLIGHT_LABELS,
  IN_FLIGHT_TITLE,
  RELEASE_WINDOW_MAX_MS,
  RELEASE_WINDOW_MIN_MS,
  SKILLS_SH_PAGE,
  SKILLS_SOURCE,
  URGENT_LABELS,
  URGENT_MARKER_PREFIX,
} from './config.js';
import { sanitizeBodyText, sanitizeTitleText } from './sanitize.js';
import type { AuditFinding, TriageLevel } from './types.js';

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: string;
}

export interface GitHubRelease {
  tag_name: string;
  published_at: string;
}

export interface InFlightEntry {
  fingerprint: string;
  skill: string;
  providerSlug: string;
  status: string;
  summary: string;
  riskLevel: string;
  triage: TriageLevel | null;
  lastSeen: string;
  urgentIssueNumber?: number;
}

export interface IssueMeta {
  lastSuccessfulSyncAt?: string;
  auditsPending?: string[];
}

export type FetchFn = typeof fetch;

export interface GitHubApiDeps {
  owner: string;
  repo: string;
  token: string;
  fetchFn?: FetchFn;
}

const META_BLOCK_RE = /<!-- skills-audit-meta\s([\s\S]*?)-->/;
const IN_FLIGHT_BLOCK_RE = /<!-- skills-audit-in-flight\s([\s\S]*?)-->/;

function apiBase(owner: string, repo: string): string {
  return `https://api.github.com/repos/${owner}/${repo}`;
}

async function githubRequest<T>(deps: GitHubApiDeps, path: string, init?: RequestInit): Promise<T> {
  const fetchFn = deps.fetchFn ?? fetch;
  const response = await fetchFn(`${apiBase(deps.owner, deps.repo)}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${deps.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${path} failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function hasBodyMarker(body: string | null | undefined): boolean {
  return body?.includes(BODY_MARKER) ?? false;
}

export function parseIssueMeta(body: string): IssueMeta {
  const match = body.match(META_BLOCK_RE);
  if (!match) {
    return {};
  }

  const meta: IssueMeta = {};
  for (const line of match[1].trim().split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) {
      continue;
    }
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (key === 'last_successful_sync_at' && value) {
      meta.lastSuccessfulSyncAt = value;
    } else if (key === 'audits_pending' && value) {
      meta.auditsPending = value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
    }
  }

  return meta;
}

export function parseInFlightEntries(body: string): InFlightEntry[] {
  const match = body.match(IN_FLIGHT_BLOCK_RE);
  if (!match) {
    return [];
  }

  try {
    const parsed = JSON.parse(match[1].trim()) as unknown;
    return Array.isArray(parsed) ? (parsed as InFlightEntry[]) : [];
  } catch {
    return [];
  }
}

function renderMetaBlock(meta: IssueMeta): string {
  const pending = meta.auditsPending?.length ? meta.auditsPending.join(',') : '';
  const lastSync = meta.lastSuccessfulSyncAt ?? '';
  return `<!-- skills-audit-meta
last_successful_sync_at: ${lastSync}
audits_pending: ${pending}
-->`;
}

function renderInFlightBlock(entries: InFlightEntry[]): string {
  return `<!-- skills-audit-in-flight
${JSON.stringify(entries, null, 2)}
-->`;
}

export function renderInFlightIssueBody(meta: IssueMeta, entries: InFlightEntry[]): string {
  return `${BODY_MARKER}

# ${IN_FLIGHT_TITLE}

Automated register of in-flight [skills.sh](${SKILLS_SH_PAGE}) partner audit findings for \`${SKILLS_SOURCE}\`. Formal acceptances live in \`security/skills-audit-accepted.yaml\`.

${renderMetaBlock(meta)}

${renderInFlightBlock(entries)}

## Triage

- **high** → dedicated urgent Issue + in-flight row
- **medium / low** → in-flight register only (+ change comment when new)
- Accepted in log → quiet ack only

Maintainer runbook: \`docs/developer/skills-audit-sync.md\`
`;
}

export function parseLastSuccessfulSyncAt(body: string): string | undefined {
  return parseIssueMeta(body).lastSuccessfulSyncAt;
}

export function setLastSuccessfulSyncAt(body: string, iso: string): string {
  const meta = parseIssueMeta(body);
  const entries = parseInFlightEntries(body);
  return renderInFlightIssueBody({ ...meta, lastSuccessfulSyncAt: iso }, entries);
}

export function formatChangeComment(
  event: 'new' | 'cleared',
  finding: Pick<AuditFinding, 'skill' | 'providerSlug' | 'status' | 'summary' | 'riskLevel'>,
  triage?: TriageLevel | null,
): string {
  const skillUrl = `${SKILLS_SH_PAGE}/${sanitizeBodyText(finding.skill, 100)}`;
  const provider = sanitizeBodyText(finding.providerSlug, 100);
  const status = sanitizeBodyText(finding.status, 200);
  const summary = sanitizeBodyText(finding.summary, 2000);
  const risk = sanitizeBodyText(finding.riskLevel, 100);

  if (event === 'cleared') {
    return [
      '### Audit finding cleared on skills.sh',
      '',
      `- **Skill:** [\`${sanitizeBodyText(finding.skill, 100)}\`](${skillUrl})`,
      `- **Provider:** \`${provider}\``,
      `- **Was:** ${status} — ${summary}`,
      '',
      'No action required unless this reappears on a future sync.',
    ].join('\n');
  }

  const triageLine = triage ? ` (**${triage}** triage)` : '';
  return [
    `### New audit finding${triageLine}`,
    '',
    `- **Skill:** [\`${sanitizeBodyText(finding.skill, 100)}\`](${skillUrl})`,
    `- **Provider:** \`${provider}\``,
    `- **Status:** ${status}`,
    `- **Risk:** ${risk}`,
    `- **Summary:** ${summary}`,
    '',
    '**Suggested next steps:** triage on the in-flight Issue, fix or open a PR to `security/skills-audit-accepted.yaml` if accepting risk.',
  ].join('\n');
}

export function urgentIssueMarker(fingerprint: string): string {
  return `${URGENT_MARKER_PREFIX} ${fingerprint} -->`;
}

export function renderUrgentIssueBody(finding: AuditFinding, fingerprint: string): string {
  const skill = sanitizeBodyText(finding.skill, 100);
  const provider = sanitizeBodyText(finding.providerSlug, 100);
  const status = sanitizeBodyText(finding.status, 200);
  const summary = sanitizeBodyText(finding.summary, 2000);
  const risk = sanitizeBodyText(finding.riskLevel, 100);

  const skillUrl = `${SKILLS_SH_PAGE}/${skill}`;
  return `${urgentIssueMarker(fingerprint)}

# Urgent: skills.sh audit finding (high)

- **Skill:** [\`${skill}\`](${skillUrl})
- **Provider:** \`${provider}\`
- **Status:** ${status}
- **Risk:** ${risk}
- **Summary:** ${summary}

Track progress here; the in-flight register Issue holds the full audit trail.
`;
}

export function urgentIssueTitle(finding: AuditFinding): string {
  const title = `[skill-security] HIGH: ${finding.skill} — ${finding.providerSlug}: ${finding.summary}`;
  return sanitizeTitleText(title, 200);
}

export function hasReleaseInDailyWindow(
  releases: GitHubRelease[],
  nowMs: number = Date.now(),
): boolean {
  return releases.some((release) => {
    if (!release.tag_name.startsWith('v')) {
      return false;
    }
    const published = Date.parse(release.published_at);
    if (Number.isNaN(published)) {
      return false;
    }
    const age = nowMs - published;
    return age >= RELEASE_WINDOW_MIN_MS && age <= RELEASE_WINDOW_MAX_MS;
  });
}

export async function listOpenIssues(deps: GitHubApiDeps): Promise<GitHubIssue[]> {
  const labels = IN_FLIGHT_LABELS.join(',');
  return githubRequest<GitHubIssue[]>(deps, `/issues?state=open&labels=${labels}&per_page=100`);
}

export async function findInFlightIssue(deps: GitHubApiDeps): Promise<GitHubIssue | null> {
  const issues = await listOpenIssues(deps);
  return issues.find((issue) => hasBodyMarker(issue.body)) ?? null;
}

export async function createInFlightIssue(deps: GitHubApiDeps): Promise<GitHubIssue> {
  return githubRequest<GitHubIssue>(deps, '/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: IN_FLIGHT_TITLE,
      labels: [...IN_FLIGHT_LABELS],
      body: renderInFlightIssueBody({}, []),
    }),
  });
}

export async function findOrCreateInFlightIssue(deps: GitHubApiDeps): Promise<GitHubIssue> {
  const existing = await findInFlightIssue(deps);
  return existing ?? createInFlightIssue(deps);
}

export async function updateIssueBody(
  deps: GitHubApiDeps,
  issueNumber: number,
  body: string,
): Promise<void> {
  await githubRequest(deps, `/issues/${issueNumber}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
}

export async function postIssueComment(
  deps: GitHubApiDeps,
  issueNumber: number,
  body: string,
): Promise<void> {
  await githubRequest(deps, `/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
}

export async function listRecentReleases(deps: GitHubApiDeps): Promise<GitHubRelease[]> {
  return githubRequest<GitHubRelease[]>(deps, '/releases?per_page=20');
}

export async function findUrgentIssue(
  deps: GitHubApiDeps,
  fingerprint: string,
): Promise<GitHubIssue | null> {
  const marker = urgentIssueMarker(fingerprint);
  const labels = URGENT_LABELS.join(',');
  const issues = await githubRequest<GitHubIssue[]>(
    deps,
    `/issues?state=open&labels=${labels}&per_page=100`,
  );
  return issues.find((issue) => issue.body?.includes(marker)) ?? null;
}

export async function upsertUrgentIssue(
  deps: GitHubApiDeps,
  finding: AuditFinding,
  fingerprint: string,
): Promise<GitHubIssue> {
  const existing = await findUrgentIssue(deps, fingerprint);
  if (existing) {
    await githubRequest(deps, `/issues/${existing.number}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: urgentIssueTitle(finding),
        body: renderUrgentIssueBody(finding, fingerprint),
      }),
    });
    return {
      ...existing,
      title: urgentIssueTitle(finding),
      body: renderUrgentIssueBody(finding, fingerprint),
    };
  }

  return githubRequest<GitHubIssue>(deps, '/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: urgentIssueTitle(finding),
      labels: [...URGENT_LABELS],
      body: renderUrgentIssueBody(finding, fingerprint),
    }),
  });
}

export function createGitHubApiFromEnv(token: string, fetchFn?: FetchFn): GitHubApiDeps {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required');
  }
  const [owner, repo] = repository.split('/');
  if (!owner || !repo) {
    throw new Error(`Invalid GITHUB_REPOSITORY: ${repository}`);
  }
  return { owner, repo, token, fetchFn };
}
