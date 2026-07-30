#!/usr/bin/env node
/**
 * Sync skills/<id>/package.json version → skills/<id>/SKILL.md metadata.version.
 * Run after `changeset version` so only bumped skill carriers update frontmatter.
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listSkillDirs,
  readPackageVersion,
  setSkillMdVersion,
  skillPackageName,
} from './lib/skill-packages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

let updated = 0;
for (const id of listSkillDirs(root)) {
  const pkgPath = join(root, 'skills', id, 'package.json');
  const skillPath = join(root, 'skills', id, 'SKILL.md');
  let version;
  try {
    version = readPackageVersion(pkgPath);
  } catch {
    console.warn(`skip ${id}: missing package.json`);
    continue;
  }
  if (dryRun) {
    console.log(`would sync ${skillPackageName(id)} → ${id}/SKILL.md metadata.version=${version}`);
    continue;
  }
  if (setSkillMdVersion(skillPath, version)) {
    console.log(`synced ${id}/SKILL.md metadata.version → ${version}`);
    updated += 1;
  }
}

if (!dryRun) {
  console.log(
    updated === 0
      ? 'No skill frontmatter versions needed updating.'
      : `Updated ${updated} skill(s).`,
  );
}
