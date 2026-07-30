/**
 * Skill version carriers: private workspace packages under skills/<id>/
 * whose package.json version is the source of truth for SKILL.md metadata.version.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const SKILL_PACKAGE_SCOPE = '@bwilliamson/skill-';

export function skillPackageName(skillId) {
  return `${SKILL_PACKAGE_SCOPE}${skillId}`;
}

export function skillIdFromPackageName(name) {
  if (!name.startsWith(SKILL_PACKAGE_SCOPE)) return null;
  return name.slice(SKILL_PACKAGE_SCOPE.length);
}

export function listSkillDirs(root) {
  const skillsDir = join(root, 'skills');
  if (!existsSync(skillsDir)) return [];
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => existsSync(join(skillsDir, name, 'SKILL.md')))
    .sort();
}

/**
 * Rewrite metadata.version in skills/<id>/SKILL.md while preserving other frontmatter.
 * Opening fence must remain "---\n" (never "---name:").
 */
export function setSkillMdVersion(skillPath, version) {
  const content = readFileSync(skillPath, 'utf-8');
  if (!content.startsWith('---\n')) {
    throw new Error(`Broken YAML fence (missing newline after ---): ${skillPath}`);
  }
  const end = content.indexOf('\n---', 4);
  if (end === -1) {
    throw new Error(`No closing frontmatter fence: ${skillPath}`);
  }
  const frontmatter = content.slice(4, end);
  if (!/^\s*version:\s*/m.test(frontmatter)) {
    throw new Error(`No version field in frontmatter: ${skillPath}`);
  }
  const nextFrontmatter = frontmatter.replace(
    /^(\s*version:\s*)(['"]?)[^'"\n]+\2\s*$/m,
    `$1'${version}'`,
  );
  if (nextFrontmatter === frontmatter) {
    return false;
  }
  writeFileSync(skillPath, `---\n${nextFrontmatter}${content.slice(end)}`);
  return true;
}

export function readPackageVersion(packageJsonPath) {
  const json = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  return json.version;
}
