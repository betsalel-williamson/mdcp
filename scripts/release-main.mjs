#!/usr/bin/env node
/**
 * Single-step release on main: version → sync skills → build → commit →
 * push to main → publish npm + tags → GitHub Releases.
 *
 * Push happens before npm publish so a failed push cannot leave registry
 * packages without the matching commit on main.
 *
 * Requires RELEASE_GITHUB_TOKEN (fine-grained maintainer PAT). No-ops when
 * there are no pending changesets.
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findMajorBumps, pendingChangesetFiles } from './lib/changeset-bumps.mjs';
import {
  changelogNotesForVersion,
  skillCarrierDirName,
  skillIdFromPackageName,
} from './lib/skill-packages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  if (!dryRun) {
    execSync(cmd, { cwd: root, stdio: 'inherit', ...opts });
  }
}

function capture(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, encoding: 'utf-8', ...opts }).trim();
}

function token() {
  // Do not fall back to GITHUB_TOKEN — push to protected main needs a PAT/App token.
  return process.env.RELEASE_GITHUB_TOKEN || '';
}

function readWorkspaceVersions() {
  const versions = new Map();
  const packagesDir = join(root, 'packages');
  for (const name of readdirSync(packagesDir)) {
    const pkgPath = join(packagesDir, name, 'package.json');
    if (!existsSync(pkgPath)) continue;
    const json = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (json.name && json.version) {
      versions.set(json.name, { version: json.version, dir: name, private: Boolean(json.private) });
    }
  }
  return versions;
}

function packageDirForName(name, dirHint) {
  if (dirHint) return dirHint;
  const id = skillIdFromPackageName(name);
  if (id) return skillCarrierDirName(id);
  return name.replace(/^@bwilliamson\//, '');
}

function createGithubRelease(tag, notes) {
  const tmp = join(root, '.tmp-release-notes.md');
  writeFileSync(tmp, `${notes}\n`);
  const env = {
    ...process.env,
    GH_TOKEN: token(),
    GITHUB_TOKEN: token(),
  };
  try {
    try {
      capture(`gh release view "${tag}"`, { env });
      console.log(`GitHub Release ${tag} already exists — updating notes`);
      run(`gh release edit "${tag}" --notes-file .tmp-release-notes.md`, { env });
    } catch {
      run(`gh release create "${tag}" --title "${tag}" --notes-file .tmp-release-notes.md`, {
        env,
      });
    }
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      // ignore
    }
  }
}

const changesetDir = join(root, '.changeset');
const pending = pendingChangesetFiles(changesetDir);
if (pending.length === 0) {
  console.log('No pending changesets — nothing to version or publish.');
  process.exit(0);
}

const majors = findMajorBumps(changesetDir);
if (majors.length > 0) {
  console.error(
    'Refusing to release: major bumps are disabled.\n' +
      majors.map((m) => `  ${m.file}: ${m.package}`).join('\n'),
  );
  process.exit(1);
}

console.log(`Pending changesets (${pending.length}): ${pending.join(', ')}`);

const ghToken = token();
if (!ghToken && !dryRun) {
  console.error(
    'RELEASE_GITHUB_TOKEN is required (fine-grained PAT with Contents write on this repo).',
  );
  process.exit(1);
}

const before = readWorkspaceVersions();

run('pnpm exec changeset version');
run('node scripts/sync-skill-versions.mjs');
run('pnpm skill:validate');
run('pnpm build');

const after = readWorkspaceVersions();
const bumped = [];
for (const [name, next] of after) {
  const prev = before.get(name);
  if (!prev || prev.version !== next.version) {
    bumped.push({
      name,
      version: next.version,
      dir: next.dir,
      private: next.private,
    });
  }
}

if (bumped.length === 0) {
  console.error('changeset version ran but no package versions changed.');
  process.exit(1);
}

console.log('Bumped:');
for (const b of bumped) {
  console.log(`  ${b.name}@${b.version}${b.private ? ' (skill carrier)' : ''}`);
}

if (!dryRun) {
  const repo = capture('gh repo view --json nameWithOwner -q .nameWithOwner', {
    env: { ...process.env, GH_TOKEN: ghToken, GITHUB_TOKEN: ghToken },
  });
  execSync(`git remote set-url origin https://x-access-token:${ghToken}@github.com/${repo}.git`, {
    cwd: root,
    stdio: 'ignore',
  });
  console.log('> git remote set-url origin (token redacted)');
}

// Runners have no git identity; required before commit (local to this clone).
run('git config user.name "github-actions[bot]"');
run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
run('git add -A');
run('git commit -m "chore: release"');

// Push the release commit to main BEFORE npm publish so a failed push cannot
// leave packages on the registry without the matching commit on main.
run('git push origin HEAD:main');

run('pnpm audit --audit-level=high');
run('pnpm exec changeset publish');

for (const b of bumped) {
  const tag = `${b.name}@${b.version}`;
  const dir = packageDirForName(b.name, b.dir);
  const notes =
    changelogNotesForVersion(join(root, 'packages', dir, 'CHANGELOG.md'), b.version) ||
    `Release ${tag}`;
  if (dryRun) {
    console.log(`would create GitHub Release ${tag}`);
    continue;
  }
  createGithubRelease(tag, notes);
}

// Ensure any tags created by changeset publish are on the remote.
run('git push origin --tags');

console.log('Release complete.');
