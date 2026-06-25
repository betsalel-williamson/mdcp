// Writes a patch changeset for Dependabot PRs so the CI `changeset` job passes.
// Invoked by .github/workflows/dependabot-changeset.yml — see versioning-and-releases.md.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FIXED_PACKAGES = [
  '@bwilliamson/mdcp-core',
  '@bwilliamson/mdcp-cli',
  '@bwilliamson/mdcp-presets',
];

const PRODUCTION_DEP_KEYS = ['dependencies', 'peerDependencies', 'optionalDependencies'];

const baseRef = process.env.BASE_REF;
const prNumber = process.env.PR_NUMBER;
const prTitle = process.env.PR_TITLE ?? 'dependabot dependency update';

if (!baseRef || !prNumber) {
  throw new Error('BASE_REF and PR_NUMBER must be set');
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

function hasExistingChangeset() {
  const dir = '.changeset';
  if (!existsSync(dir)) return false;
  return readdirSync(dir).some(
    (name) => name.endsWith('.md') && name !== 'README.md' && !name.startsWith('_'),
  );
}

function readJsonAtRef(ref, filePath) {
  try {
    return JSON.parse(git('show', `${ref}:${filePath}`));
  } catch {
    return null;
  }
}

function productionDeps(pkg) {
  if (!pkg) return {};
  const out = {};
  for (const key of PRODUCTION_DEP_KEYS) {
    if (pkg[key]) out[key] = pkg[key];
  }
  return out;
}

function productionDepsChanged(filePath) {
  const basePkg = readJsonAtRef(`origin/${baseRef}`, filePath);
  const headPkg = JSON.parse(readFileSync(filePath, 'utf8'));
  return JSON.stringify(productionDeps(basePkg)) !== JSON.stringify(productionDeps(headPkg));
}

if (hasExistingChangeset()) {
  console.log('Changeset already present; skipping.');
  process.exit(0);
}

const changed = git(
  'diff',
  '--name-only',
  `origin/${baseRef}...HEAD`,
  '--',
  'package.json',
  '**/package.json',
)
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const publishedPackageChanged = changed.some((path) => {
  if (path === 'package.json') return false;
  if (!path.startsWith('packages/') || !path.endsWith('/package.json')) return false;
  return productionDepsChanged(path);
});

if (!publishedPackageChanged) {
  console.log('No published-package production dependency changes; no changeset needed.');
  process.exit(0);
}

const summary = prTitle.replace(/\s+/g, ' ').trim();
const frontmatter = FIXED_PACKAGES.map((name) => `'${name}': patch`).join('\n');
const contents = `---\n${frontmatter}\n---\n\n${summary}\n`;

const file = join('.changeset', `dependabot-${prNumber}.md`);
writeFileSync(file, contents);

console.log(`Wrote ${file} for fixed packages: ${FIXED_PACKAGES.join(', ')}`);
