#!/usr/bin/env node
/**
 * Plan-job helper: detect workspace packages whose current version lacks a
 * GitHub Release and/or git tag. Writes has_missing_releases to GITHUB_OUTPUT.
 *
 * Uses GH_TOKEN / GITHUB_TOKEN (contents:read is enough for public releases).
 */
import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  packagesNeedingReleaseHeal,
  parseGitLsRemoteTags,
  readWorkspacePackages,
  releaseTag,
} from './lib/github-releases.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function listExistingReleaseTags() {
  const raw = execSync('gh release list --limit 1000 --json tagName', {
    cwd: root,
    encoding: 'utf-8',
  });
  const rows = JSON.parse(raw);
  return new Set(rows.map((r) => r.tagName));
}

function listRemoteGitTags() {
  const raw = execSync('git ls-remote --tags origin', {
    cwd: root,
    encoding: 'utf-8',
  });
  return parseGitLsRemoteTags(raw);
}

const packages = [...readWorkspacePackages(root).values()];
const needing = packagesNeedingReleaseHeal(
  packages,
  listExistingReleaseTags(),
  listRemoteGitTags(),
);
const hasMissing = needing.length > 0;

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `has_missing_releases=${hasMissing}\n`);
}

if (!hasMissing) {
  console.log('All current package versions already have git tags and GitHub Releases.');
  process.exit(0);
}

console.log(`Missing release artifacts (${needing.length}):`);
for (const row of needing) {
  const tag = releaseTag(row.pkg.name, row.pkg.version);
  const parts = [];
  if (row.missingTag) parts.push('tag');
  if (row.missingRelease) parts.push('release');
  console.log(`  ${tag} (missing ${parts.join(' + ')})`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = [
    '## Missing release artifacts',
    '',
    'Current package versions lack a git tag and/or GitHub Release.',
    'Approving **release** will create them idempotently at the package version commit (no version bump).',
    '',
    ...needing.map((row) => {
      const tag = releaseTag(row.pkg.name, row.pkg.version);
      const parts = [];
      if (row.missingTag) parts.push('tag');
      if (row.missingRelease) parts.push('release');
      return `- \`${tag}\` — missing ${parts.join(' + ')}`;
    }),
    '',
  ];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
}
