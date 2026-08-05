import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ReviewContext } from '../types.js';
import {
  fetchPullRequest,
  parsePrNumberFromMergeQueueRef,
  resolveGithubRepository,
  resolvePrNumberFromCommit,
} from './client.js';

export interface ResolveReviewContextOptions {
  prNumber?: number;
  baseSha?: string;
  headSha?: string;
  githubRef?: string;
}

export async function resolveReviewContext(
  opts: ResolveReviewContextOptions = {},
): Promise<ReviewContext> {
  const { owner, repo } = resolveGithubRepository();
  let prNumber = opts.prNumber;
  const githubRef = opts.githubRef ?? process.env.GITHUB_REF ?? '';

  if (!prNumber) {
    prNumber = parsePrNumberFromMergeQueueRef(githubRef) ?? undefined;
  }
  const headSha = opts.headSha ?? process.env.GITHUB_SHA ?? gitRevParse('HEAD');
  if (!prNumber) {
    prNumber = (await resolvePrNumberFromCommit(owner, repo, headSha)) ?? undefined;
  }
  if (!prNumber) {
    throw new Error(
      'Cannot resolve pull request number. Pass --pr, set GITHUB_REF (merge queue), or run on a PR head commit.',
    );
  }

  const pr = await fetchPullRequest(owner, repo, prNumber);
  const baseSha =
    opts.baseSha ??
    process.env.GITHUB_BASE_SHA ??
    process.env.GITHUB_EVENT_PULL_REQUEST_BASE_SHA ??
    gitMergeBase(pr.baseRef, headSha);

  return {
    owner,
    repo,
    prNumber,
    baseSha,
    headSha,
    prTitle: pr.title,
    prBody: pr.body,
  };
}

function gitRevParse(ref: string): string {
  return execSync(`git rev-parse ${ref}`, { encoding: 'utf8' }).trim();
}

function gitMergeBase(baseRef: string, headSha: string): string {
  try {
    return execSync(`git merge-base origin/${baseRef} ${headSha}`, { encoding: 'utf8' }).trim();
  } catch {
    return execSync(`git merge-base ${baseRef} ${headSha}`, { encoding: 'utf8' }).trim();
  }
}

export function listChangedFiles(baseSha: string, headSha: string): string[] {
  const out = execSync(`git diff --name-only ${baseSha}..${headSha}`, { encoding: 'utf8' });
  return out
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export function readFileAtRef(
  path: string,
  ref: 'head' | 'base' | 'working',
  ctx: Pick<ReviewContext, 'baseSha' | 'headSha'>,
): string | null {
  if (ref === 'working') {
    const full = join(process.cwd(), path);
    if (!existsSync(full)) return null;
    return readFileSync(full, 'utf8');
  }
  const sha = ref === 'head' ? ctx.headSha : ctx.baseSha;
  try {
    return execSync(`git show ${sha}:${path}`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  } catch {
    return null;
  }
}

export function inferHelperSkill(changedFiles: string[]): string {
  const hasCode = changedFiles.some(
    (p) => p.startsWith('packages/') && (p.includes('/src/') || p.endsWith('.ts')),
  );
  const hasSkills = changedFiles.some((p) => p.startsWith('skills/'));
  const hasDocsOnly = changedFiles.every((p) => p.startsWith('docs/') || p.endsWith('.md'));
  const hasClientDocs = changedFiles.some((p) => p.startsWith('docs/client'));
  const hasFeatureDocs = changedFiles.some((p) => p.startsWith('docs/features/'));
  const hasArch = changedFiles.some((p) => p.includes('/adr/') || p.includes('protocol/'));

  if (hasArch && !hasCode) return 'mdcp-design-architecture';
  if (hasClientDocs && !hasCode) return 'mdcp-ux';
  if (hasDocsOnly) return 'mdcp-doc-only';
  if (hasCode || hasSkills) return 'mdcp-feature-level';
  if (hasFeatureDocs) return 'mdcp-doc-only';
  return 'mdcp-feature-level';
}
