import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ReviewContext } from '../types.js';
import {
  fetchPullRequest,
  parsePrNumberFromMergeQueueRef,
  resolveGithubRepository,
  resolvePrNumberFromCommit,
} from './client.js';
import { assertGitSha, gitDiffNameOnly, gitMergeBase, gitRevParse, gitShowAtRef } from './git.js';

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
  const headSha = assertGitSha(
    opts.headSha ?? process.env.GITHUB_SHA ?? gitRevParse('HEAD'),
    'headSha',
  );
  if (!prNumber) {
    prNumber = (await resolvePrNumberFromCommit(owner, repo, headSha)) ?? undefined;
  }
  if (!prNumber) {
    throw new Error(
      'Cannot resolve pull request number. Pass --pr, set GITHUB_REF (merge queue), or run on a PR head commit.',
    );
  }

  const pr = await fetchPullRequest(owner, repo, prNumber);
  const baseSha = assertGitSha(
    opts.baseSha ??
      process.env.GITHUB_BASE_SHA ??
      process.env.GITHUB_EVENT_PULL_REQUEST_BASE_SHA ??
      gitMergeBase(pr.baseRef, headSha),
    'baseSha',
  );

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

export function listChangedFiles(baseSha: string, headSha: string): string[] {
  return gitDiffNameOnly(baseSha, headSha);
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
    return gitShowAtRef(sha, path);
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
