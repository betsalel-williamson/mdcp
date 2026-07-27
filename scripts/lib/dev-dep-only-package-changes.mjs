/**
 * Detect whether package changes are limited to packages/<name>/package.json
 * `devDependencies` (tooling / types). Those do not require a release changeset.
 */

const PACKAGES_PACKAGE_JSON = /^packages\/[^/]+\/package\.json$/;

/** @param {string} path */
export function isPackagesPackageJsonPath(path) {
  return PACKAGES_PACKAGE_JSON.test(path);
}

/**
 * @param {Record<string, unknown>} pkg
 * @returns {Record<string, unknown>}
 */
function withoutDevDependencies(pkg) {
  const rest = { ...pkg };
  delete rest.devDependencies;
  return rest;
}

/**
 * True when every non-`devDependencies` field is deeply equal.
 * Identical objects (including unchanged `devDependencies`) also return true —
 * a no-op / formatting-only touch is still “dev-dep only” for skip purposes.
 *
 * @param {Record<string, unknown>} before
 * @param {Record<string, unknown>} after
 */
export function onlyDevDependenciesDiffer(before, after) {
  return (
    JSON.stringify(withoutDevDependencies(before)) === JSON.stringify(withoutDevDependencies(after))
  );
}

/**
 * @param {string[]} changedPaths paths under packages/ (repo-relative)
 * @param {(path: string) => { before: Record<string, unknown>, after: Record<string, unknown> } | null} readPair
 */
export function isDevDependencyOnlyPackageChange(changedPaths, readPair) {
  if (changedPaths.length === 0) return false;

  for (const path of changedPaths) {
    if (!isPackagesPackageJsonPath(path)) return false;
    const pair = readPair(path);
    if (!pair) return false;
    if (!onlyDevDependenciesDiffer(pair.before, pair.after)) return false;
  }

  return true;
}
