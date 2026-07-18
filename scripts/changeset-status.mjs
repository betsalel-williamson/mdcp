#!/usr/bin/env node
/**
 * Require a pending changeset when package sources or skills/ changed since base.
 *
 * 1. Runs `changeset status --since=<base>` (packages).
 * 2. If `skills/` changed since base and there is no pending `.changeset/*.md`
 *    (other than README.md / config.json), fails — unless this PR consumed
 *    changesets (release versioning deleted `.changeset/*.md`).
 *
 * Resolution order for base:
 * 1. CHANGESET_SINCE (explicit)
 * 2. GITHUB_BASE_REF → origin/<ref> (PR workflows)
 * 3. tracked upstream of HEAD
 * 4. origin/main
 */
import { spawnSync, execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

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

function listChanged(since, pathspec) {
  const out = tryExec(`git diff --name-only ${since}..HEAD -- ${pathspec}`);
  return out ? out.split('\n').filter(Boolean) : [];
}

function pendingChangesetFiles() {
  const dir = join(process.cwd(), '.changeset');
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.filter(
    (name) => name.endsWith('.md') && name !== 'README.md' && !name.startsWith('_'),
  );
}

function changesetsConsumed(since) {
  const deleted = tryExec(`git diff --name-only --diff-filter=D ${since}..HEAD -- .changeset/`);
  return deleted.split('\n').filter((p) => p.endsWith('.md') && !p.endsWith('README.md')).length;
}

const since = resolveSince();
console.log(`changeset status --since=${since}`);
const result = spawnSync('pnpm', ['exec', 'changeset', 'status', `--since=${since}`], {
  stdio: 'inherit',
});
let exitCode = result.status ?? 1;

if (exitCode !== 0) {
  const consumed = changesetsConsumed(since);
  if (consumed > 0) {
    console.log(
      'Changesets consumed in this PR (release versioning) — skipping package changeset check.',
    );
    exitCode = 0;
  }
}

const skillChanges = listChanged(since, 'skills/');
if (skillChanges.length > 0) {
  console.log(`skills/ changed (${skillChanges.length} file(s) since ${since})`);
  const pending = pendingChangesetFiles();
  if (pending.length === 0) {
    const consumed = changesetsConsumed(since);
    if (consumed > 0) {
      console.log(
        'Changesets consumed in this PR (release versioning) — skipping skills changeset check.',
      );
    } else {
      console.error(
        'skills/ changed without a pending changeset.\n' +
          'Add one with `pnpm changeset` (typically bump @bwilliamson/mdcp-cli) and describe the skill change.\n' +
          'Do not hand-edit skills/*/SKILL.md metadata.version — release:tag syncs versions.',
      );
      exitCode = 1;
    }
  } else {
    console.log(`Pending changesets OK for skills/: ${pending.join(', ')}`);
  }
} else {
  console.log('No skills/ changes since base — skills changeset check skipped.');
}

process.exit(exitCode);
