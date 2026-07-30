#!/usr/bin/env node
/**
 * Single-step release on main: version → sync skills → build → commit →
 * push to main → publish npm → push tags → GitHub Releases.
 *
 * Push happens before npm publish so a failed push cannot leave registry
 * packages without the matching commit on main. Tags are pushed before
 * GitHub Releases so `gh release create` can resolve them; create also
 * passes `--target` so a fresh checkout can heal missing releases.
 *
 * With no pending changesets, ensures GitHub Releases exist for every
 * current workspace package version (idempotent heal after partial failure).
 *
 * Requires RELEASE_GITHUB_TOKEN (fine-grained maintainer PAT).
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findMajorBumps, pendingChangesetFiles } from './lib/changeset-bumps.mjs';
import {
  packagesMissingGithubReleases,
  readWorkspacePackages,
  releaseNotesForPackage,
  releaseTag,
} from './lib/github-releases.mjs';

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

function ghEnv() {
  const t = token();
  return {
    ...process.env,
    GH_TOKEN: t,
    GITHUB_TOKEN: t,
  };
}

function listExistingReleaseTags() {
  const raw = capture('gh release list --limit 1000 --json tagName', { env: ghEnv() });
  const rows = JSON.parse(raw);
  return new Set(rows.map((r) => r.tagName));
}

function createGithubRelease(tag, notes, target) {
  const tmp = join(root, '.tmp-release-notes.md');
  writeFileSync(tmp, `${notes}\n`);
  const env = ghEnv();
  try {
    try {
      capture(`gh release view "${tag}"`, { env });
      console.log(`GitHub Release ${tag} already exists — updating notes`);
      run(`gh release edit "${tag}" --notes-file .tmp-release-notes.md`, { env });
    } catch {
      // --target lets create work when the tag is not on the remote yet (heal / race).
      run(
        `gh release create "${tag}" --title "${tag}" --notes-file .tmp-release-notes.md --target "${target}"`,
        { env },
      );
    }
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      // ignore
    }
  }
}

function ensureGithubReleases(packages) {
  if (packages.length === 0) {
    console.log('No GitHub Releases to create or update.');
    return;
  }
  const target = dryRun ? 'HEAD' : capture('git rev-parse HEAD');
  console.log(`Ensuring GitHub Releases (${packages.length}) at target ${target}:`);
  for (const pkg of packages) {
    const tag = releaseTag(pkg.name, pkg.version);
    const notes = releaseNotesForPackage(root, pkg);
    if (dryRun) {
      console.log(`would ensure GitHub Release ${tag}`);
      continue;
    }
    createGithubRelease(tag, notes, target);
  }
}

function configureGitIdentityAndRemote(ghToken) {
  if (dryRun) return;
  const repo = capture('gh repo view --json nameWithOwner -q .nameWithOwner', {
    env: { ...process.env, GH_TOKEN: ghToken, GITHUB_TOKEN: ghToken },
  });
  execSync(`git remote set-url origin https://x-access-token:${ghToken}@github.com/${repo}.git`, {
    cwd: root,
    stdio: 'ignore',
  });
  console.log('> git remote set-url origin (token redacted)');
  // Runners have no git identity; required before commit (local to this clone).
  run('git config user.name "github-actions[bot]"');
  run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
}

const changesetDir = join(root, '.changeset');
const pending = pendingChangesetFiles(changesetDir);
const ghToken = token();

if (!ghToken && !dryRun) {
  console.error(
    'RELEASE_GITHUB_TOKEN is required (fine-grained PAT with Contents write on this repo).',
  );
  process.exit(1);
}

if (pending.length === 0) {
  console.log('No pending changesets — checking for missing GitHub Releases.');
  if (dryRun) {
    console.log('dry-run: would heal any missing GitHub Releases for current package versions.');
    process.exit(0);
  }
  configureGitIdentityAndRemote(ghToken);
  const packages = [...readWorkspacePackages(root).values()];
  const missing = packagesMissingGithubReleases(packages, listExistingReleaseTags());
  if (missing.length === 0) {
    console.log('Nothing to version, publish, or heal.');
    process.exit(0);
  }
  console.log(
    `Healing missing GitHub Releases (${missing.length}): ${missing
      .map((p) => releaseTag(p.name, p.version))
      .join(', ')}`,
  );
  ensureGithubReleases(missing);
  // Best-effort: push any local tags (e.g. left from a prior partial run on this runner).
  try {
    run('git push origin --tags');
  } catch {
    console.log('git push --tags skipped or failed (tags may already exist via --target).');
  }
  console.log('Release heal complete.');
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

const before = readWorkspacePackages(root);

run('pnpm exec changeset version');
run('node scripts/sync-skill-versions.mjs');
run('pnpm skill:validate');
run('pnpm build');

const after = readWorkspacePackages(root);
const bumped = [];
for (const [name, next] of after) {
  const prev = before.get(name);
  if (!prev || prev.version !== next.version) {
    bumped.push(next);
  }
}

if (bumped.length === 0) {
  console.error('changeset version ran but no package versions changed.');
  process.exit(1);
}

console.log('Bumped:');
for (const b of bumped) {
  console.log(`  ${releaseTag(b.name, b.version)}${b.private ? ' (skill carrier)' : ''}`);
}

configureGitIdentityAndRemote(ghToken);

run('git add -A');
run('git commit -m "chore: release"');

// Push the release commit to main BEFORE npm publish so a failed push cannot
// leave packages on the registry without the matching commit on main.
run('git push origin HEAD:main');

run('pnpm audit --audit-level=high');
run('pnpm exec changeset publish');

// Push tags before GitHub Releases so create can resolve them when present.
run('git push origin --tags');

ensureGithubReleases(bumped);

// Catch any tags created during release create (--target) or left local.
run('git push origin --tags');

console.log('Release complete.');
