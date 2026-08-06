import { execFileSync } from 'node:child_process';

const SHA_RE = /^[0-9a-f]{7,40}$/i;
const BRANCH_REF_RE = /^[A-Za-z0-9._/-]+$/;

export function assertGitSha(value: string, label: string): string {
  if (!SHA_RE.test(value)) {
    throw new Error(`Invalid git SHA for ${label}`);
  }
  return value;
}

export function assertBranchRef(value: string, label: string): string {
  if (!BRANCH_REF_RE.test(value) || value.includes('..')) {
    throw new Error(`Invalid git ref for ${label}`);
  }
  return value;
}

export function assertRepoRelativePath(value: string): string {
  if (
    value.startsWith('/') ||
    value.includes('\0') ||
    value.split('/').some((segment) => segment === '..')
  ) {
    throw new Error('Invalid repository path');
  }
  return value;
}

function assertGitRevInput(ref: string, label: string): string {
  if (ref === 'HEAD') return ref;
  if (SHA_RE.test(ref)) return ref;
  return assertBranchRef(ref, label);
}

function runGit(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

export function gitRevParse(ref: string): string {
  return runGit(['rev-parse', assertGitRevInput(ref, 'ref')]);
}

export function gitMergeBase(baseRef: string, headSha: string): string {
  const head = assertGitSha(headSha, 'headSha');
  const branch = assertBranchRef(baseRef, 'baseRef');
  try {
    return runGit(['merge-base', `origin/${branch}`, head]);
  } catch {
    return runGit(['merge-base', branch, head]);
  }
}

export function gitDiffNameOnly(baseSha: string, headSha: string): string[] {
  const base = assertGitSha(baseSha, 'baseSha');
  const head = assertGitSha(headSha, 'headSha');
  const out = execFileSync('git', ['diff', '--name-only', base, head], { encoding: 'utf8' });
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function gitShowAtRef(sha: string, path: string): string {
  const object = `${assertGitSha(sha, 'sha')}:${assertRepoRelativePath(path)}`;
  return execFileSync('git', ['show', object], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
}
