import type { ReviewFinding } from '../types.js';

const CODE_PATHS = [
  /^packages\/mdcp-core\/src\//,
  /^packages\/mdcp-cli\/src\//,
  /^packages\/mdcp-mcp\/src\//,
  /^skills\//,
];

const DOC_PATHS = [
  /^docs\/features\//,
  /^docs\/client-/,
  /^docs\/developer\//,
  /^docs\/glossary\//,
  /^docs\/repo-readme\//,
];

export function requiresDocShards(changedFiles: string[]): boolean {
  const productChanges = changedFiles.filter((p) => CODE_PATHS.some((re) => re.test(p)));
  if (productChanges.length === 0) return false;
  if (isDevDependencyOnlyPackageJsonChanges(changedFiles)) return false;
  return !changedFiles.some((p) => DOC_PATHS.some((re) => re.test(p)));
}

function isDevDependencyOnlyPackageJsonChanges(changedFiles: string[]): boolean {
  const pkgJsons = changedFiles.filter((p) => /^packages\/[^/]+\/package\.json$/.test(p));
  if (pkgJsons.length === 0) return false;
  const nonPkg = changedFiles.filter((p) => !/^packages\/[^/]+\/package\.json$/.test(p));
  const onlyPkgOrLock = nonPkg.every((p) => p === 'pnpm-lock.yaml' || p.startsWith('.changeset/'));
  return onlyPkgOrLock && pkgJsons.length > 0;
}

export function evaluateWorkItemLink(
  linkedIssues: number[],
  issueExists: (n: number) => boolean,
): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  if (linkedIssues.length === 0) {
    findings.push({
      id: 'work-item.linked',
      severity: 'error',
      category: 'work-item',
      title: 'No linked work item',
      message:
        'Pull request body must link a GitHub issue using Closes #N, Fixes #N, or Resolves #N.',
      remediation: {
        manual: [
          'Open or create a GitHub issue with acceptance criteria.',
          'Add `Closes #<issue-number>` to the PR description.',
        ],
        agent: {
          workItemLookup: 'docs/developer/agent-work-item-tracking.md',
          prompt: 'Load WORK_ITEM from the linked issue before editing. One WORK_ITEM per branch.',
        },
      },
    });
    return findings;
  }
  if (linkedIssues.length > 1) {
    findings.push({
      id: 'work-item.single',
      severity: 'warning',
      category: 'work-item',
      title: 'Multiple linked issues',
      message: `PR links ${linkedIssues.length} issues (${linkedIssues.map((n) => `#${n}`).join(', ')}). MDCP convention is one WORK_ITEM per branch.`,
      remediation: {
        manual: [
          'Split unrelated work into separate PRs, or keep one canonical issue and reference others without auto-close keywords.',
        ],
      },
    });
  }
  for (const n of linkedIssues) {
    if (!issueExists(n)) {
      findings.push({
        id: 'work-item.exists',
        severity: 'error',
        category: 'work-item',
        title: `Issue #${n} not found`,
        message: `Linked issue #${n} could not be loaded from GitHub.`,
        remediation: {
          manual: [`Verify issue #${n} exists and the token can read it.`],
        },
      });
    }
  }
  return findings;
}

export function evaluateDocAssociation(changedFiles: string[]): ReviewFinding[] {
  if (!requiresDocShards(changedFiles)) return [];
  const codeTouched = changedFiles.filter((p) => CODE_PATHS.some((re) => re.test(p)));
  return [
    {
      id: 'docs.associated',
      severity: 'error',
      category: 'documentation',
      title: 'Product change without durable docs',
      message: `Code or skill files changed (${codeTouched.slice(0, 5).join(', ')}${codeTouched.length > 5 ? ', …' : ''}) but no shards under docs/features/, docs/client-*/, or docs/developer/ were updated.`,
      remediation: {
        manual: [
          'Update shards to describe current behavior (docs-first per helper protocol).',
          'Run `pnpm docs:compile:repo` and commit regenerated README outputs when client guides change.',
        ],
        agent: {
          workItemLookup: 'docs/developer/agent-work-item-tracking.md',
          skill: 'mdcp-feature-level',
          prompt:
            'Docs first: update features/ and client/ shards before or alongside code. Validate with mdcp check.',
        },
      },
    },
  ];
}

export function relatedDocShards(changedFiles: string[]): string[] {
  const hints = new Set<string>();
  for (const p of changedFiles) {
    if (p.startsWith('packages/mdcp-cli/')) {
      hints.add('docs/client-cli/');
      hints.add('docs/features/');
    }
    if (p.startsWith('packages/mdcp-core/')) {
      hints.add('docs/client-core/');
      hints.add('docs/features/');
    }
    if (p.startsWith('packages/mdcp-mcp/')) {
      hints.add('docs/developer/');
      hints.add('docs/features/');
    }
    if (p.startsWith('skills/')) {
      hints.add('docs/features/agent-skill.md');
      hints.add('docs/features/protocol/agent-task-prompts.md');
    }
    if (p.startsWith('docs/features/')) hints.add('docs/features/');
    if (p.startsWith('docs/client-')) hints.add(p.split('/').slice(0, 2).join('/') + '/');
    if (p.startsWith('docs/developer/')) hints.add('docs/developer/');
  }
  return [...hints];
}
