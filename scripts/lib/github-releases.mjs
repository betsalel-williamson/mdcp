/**
 * Helpers for per-package GitHub Releases (`name@version` tags).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { changelogNotesForVersion } from './skill-packages.mjs';

/** @typedef {{ name: string, version: string, dir: string, private: boolean }} WorkspacePackage */

/**
 * @param {string} root
 * @returns {Map<string, WorkspacePackage>}
 */
export function readWorkspacePackages(root) {
  const versions = new Map();
  const packagesDir = join(root, 'packages');
  if (!existsSync(packagesDir)) return versions;
  for (const name of readdirSync(packagesDir)) {
    const pkgPath = join(packagesDir, name, 'package.json');
    if (!existsSync(pkgPath)) continue;
    const json = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (json.name && json.version) {
      versions.set(json.name, {
        name: json.name,
        version: json.version,
        dir: name,
        private: Boolean(json.private),
      });
    }
  }
  return versions;
}

/** @param {string} name @param {string} version */
export function releaseTag(name, version) {
  return `${name}@${version}`;
}

/**
 * Packages whose current `name@version` is not in the set of existing release tags.
 * @param {Iterable<WorkspacePackage>} packages
 * @param {ReadonlySet<string>} existingReleaseTags
 * @returns {WorkspacePackage[]}
 */
export function packagesMissingGithubReleases(packages, existingReleaseTags) {
  const missing = [];
  for (const pkg of packages) {
    const tag = releaseTag(pkg.name, pkg.version);
    if (!existingReleaseTags.has(tag)) {
      missing.push(pkg);
    }
  }
  return missing.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * @param {string} root
 * @param {WorkspacePackage} pkg
 */
export function releaseNotesForPackage(root, pkg) {
  const tag = releaseTag(pkg.name, pkg.version);
  return (
    changelogNotesForVersion(join(root, 'packages', pkg.dir, 'CHANGELOG.md'), pkg.version) ||
    `Release ${tag}`
  );
}
