#!/usr/bin/env node
/**
 * Fail if durable docs link to pending Changeset note files.
 * Allowed: .changeset/README.md and .changeset/config.json (stable tooling refs).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const docsRoot = join(root, 'docs');

/** @type {RegExp} */
const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;

/** @param {string} href */
function isPendingChangesetLink(href) {
  const bare = href.split(/[?#]/)[0] ?? href;
  if (!bare.includes('.changeset/')) return false;
  if (/\/\.changeset\/README\.md$/i.test(bare) || /\.changeset\/README\.md$/i.test(bare)) {
    return false;
  }
  if (/\/\.changeset\/config\.json$/i.test(bare) || /\.changeset\/config\.json$/i.test(bare)) {
    return false;
  }
  // Directory tree links (e.g. GitHub .../tree/.../.changeset/) count as pending surface.
  return true;
}

/** @param {string} dir @returns {string[]} */
function walkMarkdown(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '_build' || name === 'styles') continue;
      out.push(...walkMarkdown(full));
    } else if (name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];
for (const file of walkMarkdown(docsRoot)) {
  const text = readFileSync(file, 'utf8');
  let match;
  while ((match = linkRe.exec(text)) !== null) {
    const href = match[1]?.trim();
    if (!href || isPendingChangesetLink(href) === false) continue;
    violations.push(`${relative(root, file)}: ${href}`);
  }
}

if (violations.length > 0) {
  console.error(
    'Durable docs must not link to pending .changeset/* notes (use package CHANGELOGs).\n' +
      'Allowed tooling refs: .changeset/README.md, .changeset/config.json.\n',
  );
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log('lint-no-pending-changeset-links: ok');
