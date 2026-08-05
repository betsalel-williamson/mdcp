import { execSync } from 'node:child_process';
import type { GithubIssueSummary, GithubPullSummary } from '../types.js';

export const REVIEW_COMMENT_MARKER = '<!-- mdcp-merge-gate -->';

const LINKED_ISSUE_RE =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+(?:[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+#|#)(\d+)/gi;

export function parseLinkedIssueNumbers(text: string): number[] {
  const seen = new Set<number>();
  for (const match of text.matchAll(LINKED_ISSUE_RE)) {
    const n = Number(match[1]);
    if (Number.isFinite(n)) seen.add(n);
  }
  return [...seen];
}

export function resolveGithubToken(): string | undefined {
  return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
}

export function resolveGithubRepository(): { owner: string; repo: string } {
  const fromEnv = process.env.GITHUB_REPOSITORY;
  if (fromEnv?.includes('/')) {
    const [owner, repo] = fromEnv.split('/');
    if (owner && repo) return { owner, repo };
  }
  const remote = tryGitRemoteOrigin();
  if (remote) return remote;
  throw new Error(
    'Cannot resolve GitHub repository. Set GITHUB_REPOSITORY or run inside a git repo with origin.',
  );
}

function tryGitRemoteOrigin(): { owner: string; repo: string } | null {
  try {
    const url = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    const m =
      url.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/) ??
      url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (!m) return null;
    return { owner: m[1]!, repo: m[2]!.replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

export async function githubRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = resolveGithubToken();
  if (!token) {
    throw new Error(
      'GitHub token required. Set GITHUB_TOKEN or GH_TOKEN (read for issues/PRs; pull-requests: write to comment).',
    );
  }
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${method} ${path} failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

interface GhPull {
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  base: { ref: string; sha: string };
  head: { ref: string; sha: string };
}

interface GhIssue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  labels: { name: string }[];
}

export async function fetchPullRequest(
  owner: string,
  repo: string,
  number: number,
): Promise<GithubPullSummary> {
  const pr = await githubRequest<GhPull>('GET', `/repos/${owner}/${repo}/pulls/${number}`);
  const body = pr.body ?? '';
  return {
    number: pr.number,
    title: pr.title,
    body,
    state: pr.state,
    baseRef: pr.base.ref,
    headRef: pr.head.ref,
    url: pr.html_url,
    linkedIssueNumbers: parseLinkedIssueNumbers(body),
  };
}

export async function fetchIssue(
  owner: string,
  repo: string,
  number: number,
): Promise<GithubIssueSummary> {
  const issue = await githubRequest<GhIssue>('GET', `/repos/${owner}/${repo}/issues/${number}`);
  return {
    number: issue.number,
    title: issue.title,
    body: issue.body ?? '',
    state: issue.state,
    labels: issue.labels.map((l) => l.name),
    url: issue.html_url,
  };
}

export async function fetchPullRequestFiles(
  owner: string,
  repo: string,
  number: number,
): Promise<string[]> {
  const files = await githubRequest<{ filename: string }[]>(
    'GET',
    `/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`,
  );
  return files.map((f) => f.filename);
}

interface GhComment {
  id: number;
  body: string;
}

export async function upsertPullRequestComment(
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
): Promise<void> {
  const markedBody = body.includes(REVIEW_COMMENT_MARKER)
    ? body
    : `${REVIEW_COMMENT_MARKER}\n${body}`;
  const comments = await githubRequest<GhComment[]>(
    'GET',
    `/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`,
  );
  const existing = comments.find((c) => c.body.includes(REVIEW_COMMENT_MARKER));
  if (existing) {
    await githubRequest('PATCH', `/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
      body: markedBody,
    });
    return;
  }
  await githubRequest('POST', `/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    body: markedBody,
  });
}

export function parsePrNumberFromMergeQueueRef(ref: string): number | null {
  const m = ref.match(/\/pr-(\d+)-[0-9a-f]+$/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export async function resolvePrNumberFromCommit(
  owner: string,
  repo: string,
  headSha: string,
): Promise<number | null> {
  const pulls = await githubRequest<{ number: number }[]>(
    'GET',
    `/repos/${owner}/${repo}/commits/${headSha}/pulls`,
  );
  if (pulls.length === 0) return null;
  return pulls[0]!.number;
}
