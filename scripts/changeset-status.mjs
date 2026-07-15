#!/usr/bin/env node
/**
 * Run `changeset status` against a merge-base ref for the current branch.
 *
 * Resolution order:
 * 1. CHANGESET_SINCE (explicit)
 * 2. GITHUB_BASE_REF → origin/<ref> (PR workflows)
 * 3. tracked upstream of HEAD
 * 4. origin/main (release default only — not the only supported merge target)
 */
import { spawnSync, execSync } from 'node:child_process';

function tryExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function resolveSince() {
  if (process.env.CHANGESET_SINCE) {
    return process.env.CHANGESET_SINCE;
  }
  const baseRef = process.env.GITHUB_BASE_REF;
  if (baseRef) {
    return `origin/${baseRef}`;
  }
  const upstream = tryExec('git rev-parse --abbrev-ref --symbolic-full-name @{upstream}');
  if (upstream && upstream !== 'HEAD') {
    return upstream;
  }
  return 'origin/main';
}

const since = resolveSince();
console.log(`changeset status --since=${since}`);
const result = spawnSync('pnpm', ['exec', 'changeset', 'status', `--since=${since}`], {
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
