import { spawnSync } from 'node:child_process';
import type { ReviewContext, ReviewFinding, ReviewToolDefinition } from '../types.js';
import {
  fetchIssue,
  fetchPullRequest,
  fetchPullRequestFiles,
  upsertPullRequestComment,
} from '../github/client.js';
import { inferHelperSkill, listChangedFiles, readFileAtRef } from '../github/pr-context.js';
import {
  evaluateDocAssociation,
  evaluateWorkItemLink,
  relatedDocShards,
} from '../review/programmatic.js';
import { REVIEW_RUBRIC } from '../review/rubric.js';

export const REVIEW_TOOLS: ReviewToolDefinition[] = [
  {
    name: 'work_item_get',
    description: 'Read-only: load a GitHub issue for WORK_ITEM scope.',
    access: 'read',
    domain: 'work-item',
    inputSchema: {
      type: 'object',
      properties: {
        issue: { type: 'number' },
        from_pr: { type: 'number' },
      },
    },
  },
  {
    name: 'pr_get',
    description: 'Read-only: load pull request metadata and linked issue numbers.',
    access: 'read',
    domain: 'pr',
    inputSchema: {
      type: 'object',
      properties: { number: { type: 'number' } },
      required: ['number'],
    },
  },
  {
    name: 'diff_list',
    description: 'Read-only: list paths changed between base and head SHAs.',
    access: 'read',
    domain: 'code',
    inputSchema: {
      type: 'object',
      properties: { base: { type: 'string' }, head: { type: 'string' } },
    },
  },
  {
    name: 'file_read',
    description: 'Read-only: read a repository file at base, head, or working tree.',
    access: 'read',
    domain: 'code',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        ref: { type: 'string', enum: ['head', 'base', 'working'] },
      },
      required: ['path'],
    },
  },
  {
    name: 'docs_related',
    description: 'Read-only: suggest doc shard directories related to changed paths.',
    access: 'read',
    domain: 'code',
    inputSchema: {
      type: 'object',
      properties: { paths: { type: 'array', items: { type: 'string' } } },
    },
  },
  {
    name: 'check_programmatic',
    description: 'Run deterministic MDCP merge checks (work-item link, docs association).',
    access: 'read',
    domain: 'review',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'check_mdcp',
    description: 'Spawn mdcp check with repo config; returns exit code and output.',
    access: 'read',
    domain: 'review',
    inputSchema: {
      type: 'object',
      properties: {
        config: { type: 'string' },
        docsRoot: { type: 'string' },
      },
    },
  },
  {
    name: 'review_rubric',
    description: 'Read-only: MDCP helper protocol rubric for agentic documentation review.',
    access: 'read',
    domain: 'review',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'pr_comment',
    description: 'Write: create or update the sticky MDCP merge-gate comment on a pull request.',
    access: 'write',
    domain: 'pr',
    inputSchema: {
      type: 'object',
      properties: { number: { type: 'number' }, body: { type: 'string' } },
      required: ['number', 'body'],
    },
  },
];

export interface ToolCallContext {
  review: ReviewContext;
}

export async function callReviewTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolCallContext,
): Promise<unknown> {
  const { review } = ctx;
  switch (name) {
    case 'work_item_get': {
      let issueNum = args.issue as number | undefined;
      if (args.from_pr) {
        const pr = await fetchPullRequest(review.owner, review.repo, args.from_pr as number);
        issueNum = pr.linkedIssueNumbers[0];
      }
      if (!issueNum) throw new Error('work_item_get requires issue or from_pr with a linked issue');
      return fetchIssue(review.owner, review.repo, issueNum);
    }
    case 'pr_get':
      return fetchPullRequest(
        review.owner,
        review.repo,
        (args.number as number) ?? review.prNumber,
      );
    case 'diff_list': {
      const base = (args.base as string) ?? review.baseSha;
      const head = (args.head as string) ?? review.headSha;
      return { base, head, paths: listChangedFiles(base, head) };
    }
    case 'file_read': {
      const path = args.path as string;
      const ref = (args.ref as 'head' | 'base' | 'working') ?? 'head';
      const content = readFileAtRef(path, ref, review);
      return { path, ref, content, missing: content === null };
    }
    case 'docs_related': {
      const paths = (args.paths as string[]) ?? listChangedFiles(review.baseSha, review.headSha);
      return { hints: relatedDocShards(paths), suggested_skill: inferHelperSkill(paths) };
    }
    case 'check_programmatic':
      return runProgrammaticChecks(ctx);
    case 'check_mdcp':
      return runMdcpCheck(args);
    case 'review_rubric':
      return { rubric: REVIEW_RUBRIC };
    case 'pr_comment': {
      const n = (args.number as number) ?? review.prNumber;
      await upsertPullRequestComment(review.owner, review.repo, n, args.body as string);
      return { ok: true, pr: n };
    }
    default:
      throw new Error(`Unknown review tool: ${name}`);
  }
}

function runMdcpCheck(args: Record<string, unknown>): {
  exitCode: number | null;
  stdout: string;
  stderr: string;
} {
  const config = (args.config as string) ?? 'docs/mdcp.config.json';
  const docsRoot = (args.docsRoot as string) ?? 'docs';
  const cli = process.env.MDCP_CLI ?? 'node packages/mdcp-cli/dist/cli.js';
  const parts = cli.split(' ');
  const cmd = parts[0]!;
  const cliArgs = [
    ...parts.slice(1),
    'check',
    '--config',
    config,
    '--docs-root',
    docsRoot,
    '--require-lint',
    '--require-vale',
  ];
  const result = spawnSync(cmd, cliArgs, { encoding: 'utf8', cwd: process.cwd() });
  return {
    exitCode: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

export async function runProgrammaticChecks(ctx: ToolCallContext): Promise<{
  findings: ReviewFinding[];
  changedFiles: string[];
  linkedIssues: number[];
}> {
  const pr = await fetchPullRequest(ctx.review.owner, ctx.review.repo, ctx.review.prNumber);
  let changedFiles = listChangedFiles(ctx.review.baseSha, ctx.review.headSha);
  if (changedFiles.length === 0) {
    changedFiles = await fetchPullRequestFiles(
      ctx.review.owner,
      ctx.review.repo,
      ctx.review.prNumber,
    );
  }

  const linked = pr.linkedIssueNumbers;
  const existence: Record<number, boolean> = {};
  for (const n of linked) {
    try {
      await fetchIssue(ctx.review.owner, ctx.review.repo, n);
      existence[n] = true;
    } catch {
      existence[n] = false;
    }
  }

  const findings: ReviewFinding[] = [
    ...evaluateWorkItemLink(linked, (n) => existence[n] === true),
    ...evaluateDocAssociation(changedFiles),
  ];

  return { findings, changedFiles, linkedIssues: linked };
}
