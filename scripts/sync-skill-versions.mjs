#!/usr/bin/env node
/**
 * Sync packages/skill-<id>/package.json version → skills/<id>/SKILL.md metadata.version.
 * Run after `changeset version`. Carriers stay under packages/ so skills/ stays lean
 * for `npx skills add`.
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listSkillCarrierIds,
  readPackageVersion,
  setSkillMdVersion,
  skillCarrierPackageJsonPath,
  skillPackageName,
} from './lib/skill-packages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

let updated = 0;
for (const id of listSkillCarrierIds(root)) {
  const pkgPath = skillCarrierPackageJsonPath(root, id);
  const skillPath = join(root, 'skills', id, 'SKILL.md');
  let version;
  try {
    version = readPackageVersion(pkgPath);
  } catch {
    console.warn(`skip ${id}: missing carrier package.json`);
    continue;
  }
  if (dryRun) {
    console.log(
      `would sync ${skillPackageName(id)} → skills/${id}/SKILL.md metadata.version=${version}`,
    );
    continue;
  }
  if (setSkillMdVersion(skillPath, version)) {
    console.log(`synced skills/${id}/SKILL.md metadata.version → ${version}`);
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
