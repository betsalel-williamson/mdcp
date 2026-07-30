#!/usr/bin/env node
/**
 * Plan-job helper: detect workspace packages whose current version has no
 * GitHub Release. Writes has_missing_releases to GITHUB_OUTPUT when set.
 *
 * Uses GH_TOKEN / GITHUB_TOKEN (contents:read is enough for public releases).
 */
import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  packagesMissingGithubReleases,
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

const packages = [...readWorkspacePackages(root).values()];
const existing = listExistingReleaseTags();
const missing = packagesMissingGithubReleases(packages, existing);
const hasMissing = missing.length > 0;

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `has_missing_releases=${hasMissing}\n`);
}

if (!hasMissing) {
  console.log('All current package versions already have GitHub Releases.');
  process.exit(0);
}

console.log(`Missing GitHub Releases (${missing.length}):`);
for (const pkg of missing) {
  console.log(`  ${releaseTag(pkg.name, pkg.version)}`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = [
    '## Missing GitHub Releases',
    '',
    'Current package versions on this commit have no GitHub Release yet.',
    'Approving **release** will create them idempotently (no version bump).',
    '',
    ...missing.map((pkg) => `- \`${releaseTag(pkg.name, pkg.version)}\``),
    '',
  ];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
}
