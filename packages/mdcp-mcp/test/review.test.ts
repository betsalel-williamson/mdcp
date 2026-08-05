import { describe, it, expect } from 'vitest';
import { parseLinkedIssueNumbers, parsePrNumberFromMergeQueueRef } from '../src/github/client.js';
import {
  requiresDocShards,
  evaluateDocAssociation,
  evaluateWorkItemLink,
} from '../src/review/programmatic.js';
import { formatReviewComment, verdictFromFindings } from '../src/review/comment.js';
import { REVIEW_TOOLS } from '../src/tools/registry.js';

describe('github client', () => {
  it('parses linked issue numbers from PR body', () => {
    expect(parseLinkedIssueNumbers('Closes #42 and fixes org/repo#99')).toEqual([42, 99]);
    expect(parseLinkedIssueNumbers('no link')).toEqual([]);
  });

  it('parses PR number from merge queue ref', () => {
    expect(parsePrNumberFromMergeQueueRef('refs/heads/gh-readonly-queue/main/pr-123-abcdef')).toBe(
      123,
    );
    expect(parsePrNumberFromMergeQueueRef('refs/heads/main')).toBeNull();
  });
});

describe('programmatic review', () => {
  it('flags code changes without docs', () => {
    expect(
      requiresDocShards(['packages/mdcp-core/src/index.ts', 'packages/mdcp-cli/src/cli.ts']),
    ).toBe(true);
    const findings = evaluateDocAssociation(['packages/mdcp-core/src/foo.ts']);
    expect(findings.some((f) => f.id === 'docs.associated')).toBe(true);
  });

  it('passes when docs updated with code', () => {
    expect(
      requiresDocShards(['packages/mdcp-core/src/index.ts', 'docs/features/overview.md']),
    ).toBe(false);
  });

  it('requires work item link', () => {
    const findings = evaluateWorkItemLink([], () => false);
    expect(findings.some((f) => f.id === 'work-item.linked')).toBe(true);
  });
});

describe('comment formatter', () => {
  it('formats failing comment with remediation', () => {
    const verdict = verdictFromFindings([
      {
        id: 'work-item.linked',
        severity: 'error',
        category: 'work-item',
        title: 'No linked work item',
        message: 'Add Closes #N',
        remediation: { manual: ['Add Closes #1 to PR body'] },
      },
    ]);
    const body = formatReviewComment(verdict);
    expect(body).toContain('mdcp-merge-gate');
    expect(body).toContain('Merge blocked');
  });
});

describe('tool registry', () => {
  it('exports MCP-light tools with schemas', () => {
    expect(REVIEW_TOOLS.length).toBeGreaterThan(5);
    expect(REVIEW_TOOLS.every((t) => t.name && t.description && t.inputSchema)).toBe(true);
    expect(REVIEW_TOOLS.some((t) => t.name === 'pr_comment' && t.access === 'write')).toBe(true);
  });
});
