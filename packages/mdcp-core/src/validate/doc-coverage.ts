import { relative, resolve, sep } from 'node:path';

/** Default Code Repository Archetype guide surfaces. */
export type DocSurface = 'features' | 'client' | 'developer' | 'glossary';

export type DocCoverageStatus = 'covered' | 'missing_docs' | 'needs_clarification';

export type DocCoverageMode = 'advisory' | 'gate';

export type DocCoverageConfidence = 'high' | 'low';

export interface DocCoverageReason {
  surface: DocSurface;
  confidence: DocCoverageConfidence;
  paths: string[];
  detail: string;
}

export interface DocCoverageQuestion {
  id: string;
  prompt: string;
}

export interface DocCoverageResult {
  status: DocCoverageStatus;
  mode: DocCoverageMode;
  docSurfaces: DocSurface[];
  candidateShards: string[];
  reasons: DocCoverageReason[];
  questions: DocCoverageQuestion[];
  changedPaths: string[];
  docsChanged: string[];
  codeChanged: string[];
}

export interface EvaluateDocCoverageOptions {
  /** Repo-root-relative paths that changed (from git diff / PR / host). */
  changedPaths: string[];
  /**
   * Docs root relative to the repo root (or absolute). Used to detect docs
   * changes and to build candidate shard suggestions. Default: `docs`.
   */
  docsRoot?: string;
  /** Evaluation mode. Default: `advisory`. */
  mode?: DocCoverageMode;
  /**
   * Absolute repo root used only when `docsRoot` is absolute, so docs-relative
   * paths can be normalized. Optional for relative `docsRoot`.
   */
  repoRoot?: string;
  /**
   * Optional override: map surfaces to guide directory names under docsRoot.
   * Defaults follow the Code Repository Archetype naming heuristics.
   */
  guideSurfaces?: Partial<Record<DocSurface, string[]>>;
}

const DEFAULT_HIL_QUESTIONS: DocCoverageQuestion[] = [
  {
    id: 'audience',
    prompt:
      'Is this change user-facing, maintainer-facing, or both? (Maps to client vs developer vs features.)',
  },
  {
    id: 'change-kind',
    prompt:
      'Does it change product behavior/contracts, setup/validation workflow, end-user usage, or vocabulary?',
  },
  {
    id: 'existing-shard',
    prompt:
      'Which existing shard (if any) should be extended, or should a new shard be created under features/client/developer/glossary?',
  },
];

const IGNORE_PREFIXES = [
  'node_modules/',
  'dist/',
  'build/',
  'coverage/',
  '.git/',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  '.changeset/',
];

const IGNORE_EXACT = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  '.gitignore',
  '.npmrc',
  '.nvmrc',
  '.prettierignore',
  '.prettierrc.json',
  'tsconfig.base.json',
  'eslint.config.mjs',
  'commitlint.config.mjs',
]);

const DEVELOPER_PREFIXES = [
  '.github/',
  '.husky/',
  '.cursor/',
  'scripts/',
  'skills/',
  'tests/',
  'legacy/',
];

const DEVELOPER_EXACT = new Set([
  'AGENTS.md',
  'DEVELOPERS.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'LICENSE',
  'skills-lock.json',
  'skills.sh.json',
]);

const CLIENT_PREFIXES = ['packages/mdcp-cli/', 'packages/mdcp-presets/', 'packages/mdcp-core/'];

const CLIENT_EXACT = new Set([
  'README.md',
  'packages/mdcp-cli/README.md',
  'packages/mdcp-core/README.md',
]);

const PRODUCT_PREFIXES = ['packages/', 'src/', 'lib/', 'app/', 'services/', 'apps/'];

function toPosix(p: string): string {
  return p.split(sep).join('/');
}

/** Normalize a host-supplied path to a repo-relative POSIX path without leading `./`. */
export function normalizeChangedPath(raw: string): string {
  let p = toPosix(raw.trim());
  if (!p) return '';
  while (p.startsWith('./')) p = p.slice(2);
  if (p.startsWith('/')) {
    // Absolute paths are kept as-is only when comparing against absolute docsRoot later;
    // prefer callers to pass repo-relative paths.
    p = p.replace(/^\/+/, '');
  }
  return p;
}

function isIgnored(path: string): boolean {
  if (IGNORE_EXACT.has(path)) return true;
  return IGNORE_PREFIXES.some(
    (prefix) => path === prefix.replace(/\/$/, '') || path.startsWith(prefix),
  );
}

function defaultGuideDirs(surface: DocSurface): string[] {
  switch (surface) {
    case 'features':
      return ['features'];
    case 'client':
      return ['client', 'client-cli', 'client-core', 'repo-readme'];
    case 'developer':
      return ['developer'];
    case 'glossary':
      return ['glossary'];
  }
}

function guideDirsFor(
  surface: DocSurface,
  override: Partial<Record<DocSurface, string[]>> | undefined,
): string[] {
  return override?.[surface] ?? defaultGuideDirs(surface);
}

function docsRootPrefix(docsRoot: string): string {
  const p = toPosix(docsRoot).replace(/\/+$/, '');
  if (!p || p === '.' || p === './') return '';
  // If absolute, use basename only for relative classification when repoRoot unknown —
  // callers should pass relative docsRoot for PR diffs.
  if (p.startsWith('/')) {
    const parts = p.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? 'docs';
  }
  return p;
}

function pathUnderDocs(path: string, docsPrefix: string): string | null {
  if (!docsPrefix) {
    // docsRoot is `.` — treat top-level guide dirs as docs
    return null;
  }
  if (path === docsPrefix) return '';
  if (path.startsWith(`${docsPrefix}/`)) return path.slice(docsPrefix.length + 1);
  return null;
}

function surfaceForDocsRel(
  docsRel: string,
  guideSurfaces: Partial<Record<DocSurface, string[]>> | undefined,
): DocSurface | null {
  const surfaces: DocSurface[] = ['features', 'client', 'developer', 'glossary'];
  for (const surface of surfaces) {
    for (const dir of guideDirsFor(surface, guideSurfaces)) {
      if (docsRel === dir || docsRel.startsWith(`${dir}/`)) return surface;
    }
  }
  // Heuristic: guide name contains the surface token
  const first = docsRel.split('/')[0] ?? '';
  const lower = first.toLowerCase();
  if (lower.includes('feature')) return 'features';
  if (lower.includes('client') || lower.includes('readme')) return 'client';
  if (lower.includes('developer') || lower.includes('contrib')) return 'developer';
  if (lower.includes('glossary')) return 'glossary';
  return null;
}

function candidateFor(surface: DocSurface, docsPrefix: string): string {
  const dir = defaultGuideDirs(surface)[0];
  return docsPrefix ? `${docsPrefix}/${dir}/` : `${dir}/`;
}

function resolveDocsPrefix(docsRoot: string, repoRoot?: string): string {
  const raw = toPosix(docsRoot).replace(/\/+$/, '') || 'docs';
  if (!raw.startsWith('/')) return docsRootPrefix(raw);
  if (!repoRoot) return docsRootPrefix(raw);
  const rel = toPosix(relative(resolve(repoRoot), resolve(docsRoot)));
  if (!rel || rel.startsWith('..')) return docsRootPrefix(raw);
  return docsRootPrefix(rel);
}

/**
 * Evaluate whether a change set has adequate MDCP shard coverage.
 *
 * Hosts supply changed paths; this function owns taxonomy inference and the
 * human-in-the-loop question set for low-confidence cases.
 */
export function evaluateDocCoverage(opts: EvaluateDocCoverageOptions): DocCoverageResult {
  const mode: DocCoverageMode = opts.mode ?? 'advisory';
  const docsRoot = opts.docsRoot ?? 'docs';
  const docsPrefix = resolveDocsPrefix(docsRoot, opts.repoRoot);

  const changedPaths = [
    ...new Set(opts.changedPaths.map(normalizeChangedPath).filter((p) => p.length > 0)),
  ].sort();

  const docsChanged: string[] = [];
  const codeChanged: string[] = [];
  const ambiguous: string[] = [];

  const touchedDocs = new Set<DocSurface>();
  const required = new Map<
    DocSurface,
    { confidence: DocCoverageConfidence; paths: string[]; detail: string }
  >();

  const bumpRequired = (
    surface: DocSurface,
    confidence: DocCoverageConfidence,
    path: string,
    detail: string,
  ) => {
    const prev = required.get(surface);
    if (!prev) {
      required.set(surface, { confidence, paths: [path], detail });
      return;
    }
    if (!prev.paths.includes(path)) prev.paths.push(path);
    if (prev.confidence === 'low' && confidence === 'high') {
      prev.confidence = 'high';
      prev.detail = detail;
    }
  };

  for (const path of changedPaths) {
    if (isIgnored(path)) {
      continue;
    }

    const under = pathUnderDocs(path, docsPrefix);
    if (under !== null) {
      docsChanged.push(path);
      const surface = surfaceForDocsRel(under, opts.guideSurfaces);
      if (surface) touchedDocs.add(surface);
      continue;
    }

    // Top-level guide dirs when docsRoot is `.`
    if (!docsPrefix) {
      const surface = surfaceForDocsRel(path, opts.guideSurfaces);
      if (surface) {
        docsChanged.push(path);
        touchedDocs.add(surface);
        continue;
      }
    }

    if (DEVELOPER_EXACT.has(path) || DEVELOPER_PREFIXES.some((p) => path.startsWith(p))) {
      codeChanged.push(path);
      bumpRequired('developer', 'high', path, 'Contributor tooling or maintainer workflow changed');
      continue;
    }

    if (CLIENT_EXACT.has(path)) {
      codeChanged.push(path);
      bumpRequired('client', 'high', path, 'Client-facing packaging or landing docs path changed');
      continue;
    }

    if (CLIENT_PREFIXES.some((p) => path.startsWith(p)) && /\.(ts|tsx|js|mjs|cjs)$/.test(path)) {
      codeChanged.push(path);
      bumpRequired('features', 'high', path, 'Published package source changed');
      bumpRequired('client', 'high', path, 'CLI/library consumer surface likely affected');
      continue;
    }

    if (PRODUCT_PREFIXES.some((p) => path.startsWith(p))) {
      codeChanged.push(path);
      // Prefer features for general product source; client when under client packages already handled
      bumpRequired('features', 'high', path, 'Product or package source changed');
      if (path.includes('/README') || path.endsWith('README.md')) {
        bumpRequired('client', 'high', path, 'Package README or consumer-facing file changed');
      }
      continue;
    }

    // Root package.json / workspace config → developer
    if (
      path === 'package.json' ||
      path === 'pnpm-workspace.yaml' ||
      path.endsWith('/package.json')
    ) {
      codeChanged.push(path);
      bumpRequired('developer', 'high', path, 'Workspace or package manifests changed');
      continue;
    }

    ambiguous.push(path);
  }

  const reasons: DocCoverageReason[] = [];
  const missingHigh: DocSurface[] = [];
  const docSurfaces = new Set<DocSurface>();

  for (const [surface, info] of required) {
    docSurfaces.add(surface);
    const already = touchedDocs.has(surface);
    reasons.push({
      surface,
      confidence: info.confidence,
      paths: [...info.paths].sort(),
      detail: already
        ? `${info.detail}; matching ${surface} docs already in the change set`
        : info.detail,
    });
    if (!already && info.confidence === 'high') missingHigh.push(surface);
  }

  // Docs-only or ignore-only changes are covered even with no required surfaces.
  for (const surface of touchedDocs) docSurfaces.add(surface);

  const candidateShards = [...docSurfaces]
    .sort()
    .filter((s) => !touchedDocs.has(s))
    .map((s) => candidateFor(s, docsPrefix));

  let status: DocCoverageStatus;
  let questions: DocCoverageQuestion[] = [];

  if (missingHigh.length > 0) {
    status = 'missing_docs';
  } else if (required.size === 0 && ambiguous.length > 0 && docsChanged.length === 0) {
    status = 'needs_clarification';
    questions = DEFAULT_HIL_QUESTIONS.map((q) => ({ ...q }));
    reasons.push({
      surface: 'features',
      confidence: 'low',
      paths: [...ambiguous].sort(),
      detail: 'Changed paths do not map cleanly to MDCP guide surfaces',
    });
    docSurfaces.add('features');
    candidateShards.push(candidateFor('features', docsPrefix));
  } else if (required.size === 0 && ambiguous.length > 0 && codeChanged.length === 0) {
    // Ambiguous alongside docs — covered if docs present, else clarify
    status = docsChanged.length > 0 ? 'covered' : 'needs_clarification';
    if (status === 'needs_clarification') {
      questions = DEFAULT_HIL_QUESTIONS.map((q) => ({ ...q }));
    }
  } else {
    status = 'covered';
  }

  // Deduplicate candidate shards
  const uniqueCandidates = [...new Set(candidateShards)].sort();

  return {
    status,
    mode,
    docSurfaces: [...docSurfaces].sort(),
    candidateShards: uniqueCandidates,
    reasons: reasons.sort((a, b) => a.surface.localeCompare(b.surface)),
    questions,
    changedPaths,
    docsChanged: [...docsChanged].sort(),
    codeChanged: [...codeChanged].sort(),
  };
}

/** Exit code for CLI hosts: advisory always 0 for verdicts; gate fails on non-covered. */
export function docCoverageExitCode(result: DocCoverageResult): number {
  if (result.mode === 'advisory') return 0;
  return result.status === 'covered' ? 0 : 1;
}
