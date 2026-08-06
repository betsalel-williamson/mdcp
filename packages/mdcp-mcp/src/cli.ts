#!/usr/bin/env node
import cac from 'cac';
import { readFileSync } from 'node:fs';
import { REVIEW_TOOLS, callReviewTool } from './tools/registry.js';
import { resolveReviewContext } from './github/pr-context.js';
import { buildReviewBrief } from './review/brief.js';
import { runMergeGate } from './review/run.js';
import { formatReviewComment } from './review/comment.js';
import { fetchPullRequest, upsertPullRequestComment } from './github/client.js';
import type { ReviewFinding, ReviewVerdict } from './types.js';

const cli = cac('mdcp-mcp');

function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

function parseJsonArgs(raw?: string): Record<string, unknown> {
  if (!raw || raw.trim() === '') return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

cli.command('tools', 'List MCP-light tool descriptors for agent hosts').action(() => {
  printJson(REVIEW_TOOLS);
});

cli
  .command('call <tool>', 'Invoke one MCP-light review tool')
  .option('--pr <number>', 'Pull request number for context')
  .option('--base <sha>', 'Base SHA')
  .option('--head <sha>', 'Head SHA')
  .option('--args <json>', 'Tool arguments as JSON object')
  .action(
    async (tool: string, opts: { pr?: string; base?: string; head?: string; args?: string }) => {
      const review = await resolveReviewContext({
        prNumber: opts.pr ? Number(opts.pr) : undefined,
        baseSha: opts.base,
        headSha: opts.head,
      });
      const result = await callReviewTool(tool, parseJsonArgs(opts.args), { review });
      printJson(result);
    },
  );

cli
  .command('brief', 'Build agent review brief (JSON) for offline agent runners')
  .option('--pr <number>', 'Pull request number')
  .option('--base <sha>', 'Base SHA')
  .option('--head <sha>', 'Head SHA')
  .action(async (opts: { pr?: string; base?: string; head?: string }) => {
    const review = await resolveReviewContext({
      prNumber: opts.pr ? Number(opts.pr) : undefined,
      baseSha: opts.base,
      headSha: opts.head,
    });
    const brief = await buildReviewBrief({ review });
    printJson(brief);
  });

cli
  .command('submit', 'Post agent findings JSON to the PR')
  .option('--pr <number>', 'Pull request number')
  .option('--findings <path>', 'Path to findings JSON file')
  .option('--pass', 'Mark verdict as pass')
  .action(async (opts: { pr?: string; findings?: string; pass?: boolean }) => {
    if (!opts.findings) {
      console.error('submit requires --findings <path>');
      process.exit(1);
    }
    const parsed = JSON.parse(readFileSync(opts.findings, 'utf8')) as {
      findings?: ReviewFinding[];
      pass?: boolean;
      summary?: string;
    };
    const findings = parsed.findings ?? [];
    const verdict: ReviewVerdict = {
      pass: opts.pass ?? parsed.pass ?? !findings.some((f) => f.severity === 'error'),
      findings,
      summary: parsed.summary,
      agentic: true,
    };
    const review = await resolveReviewContext({
      prNumber: opts.pr ? Number(opts.pr) : undefined,
    });
    const pr = await fetchPullRequest(review.owner, review.repo, review.prNumber);
    const body = formatReviewComment(verdict, pr.url);
    await upsertPullRequestComment(review.owner, review.repo, review.prNumber, body);
    if (!verdict.pass) process.exit(1);
  });

cli
  .command('run', 'Run MDCP merge gate (programmatic + optional agentic review)')
  .option('--pr <number>', 'Pull request number')
  .option('--base <sha>', 'Base SHA')
  .option('--head <sha>', 'Head SHA')
  .option('--agent', 'Enable agentic review when ANTHROPIC_API_KEY is set')
  .option('--no-agent', 'Skip agentic review')
  .option('--no-comment', 'Do not post PR comment')
  .option('--brief-only', 'Print brief JSON and exit')
  .action(
    async (opts: {
      pr?: string;
      base?: string;
      head?: string;
      agent?: boolean;
      noAgent?: boolean;
      noComment?: boolean;
      briefOnly?: boolean;
    }) => {
      if (opts.briefOnly) {
        const review = await resolveReviewContext({
          prNumber: opts.pr ? Number(opts.pr) : undefined,
          baseSha: opts.base,
          headSha: opts.head,
        });
        const brief = await buildReviewBrief({ review });
        printJson(brief);
        return;
      }

      const useAgent = opts.noAgent
        ? false
        : (opts.agent ?? Boolean(process.env.ANTHROPIC_API_KEY));
      const result = await runMergeGate({
        prNumber: opts.pr ? Number(opts.pr) : undefined,
        baseSha: opts.base,
        headSha: opts.head,
        agent: useAgent,
        comment: !opts.noComment,
        skipAgentOnProgrammaticFailure: true,
      });
      printJson({
        pass: result.verdict.pass,
        commented: result.commented,
        findings: result.verdict.findings,
        summary: result.verdict.summary,
      });
      if (!result.verdict.pass) process.exit(1);
    },
  );

try {
  cli.parse();
  if (!cli.matchedCommand) {
    cli.outputHelp();
    process.exit(1);
  }
} catch (e: unknown) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}
