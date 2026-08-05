import type { ReviewVerdict } from '../types.js';
import { fetchPullRequest, upsertPullRequestComment } from '../github/client.js';
import { resolveReviewContext, type ResolveReviewContextOptions } from '../github/pr-context.js';
import { buildReviewBrief, mergeVerdicts } from './brief.js';
import { formatReviewComment } from './comment.js';
import { runAgentReview, type RunAgentReviewOptions } from './agent.js';
import { runProgrammaticChecks, type ToolCallContext } from '../tools/registry.js';

export interface RunMergeGateOptions extends ResolveReviewContextOptions {
  agent?: boolean;
  agentOptions?: RunAgentReviewOptions;
  comment?: boolean;
  skipAgentOnProgrammaticFailure?: boolean;
}

export interface MergeGateResult {
  verdict: ReviewVerdict;
  brief: Awaited<ReturnType<typeof buildReviewBrief>>;
  commented: boolean;
}

export async function runMergeGate(opts: RunMergeGateOptions = {}): Promise<MergeGateResult> {
  const review = await resolveReviewContext(opts);
  const ctx: ToolCallContext = { review };
  const brief = await buildReviewBrief(ctx);
  const programmatic = await runProgrammaticChecks(ctx);

  const programmaticFailed = programmatic.findings.some((f) => f.severity === 'error');
  const useAgent =
    opts.agent !== false && (opts.agent === true || Boolean(process.env.ANTHROPIC_API_KEY));

  let agentFindings: typeof programmatic.findings = [];
  if (useAgent && (!opts.skipAgentOnProgrammaticFailure || !programmaticFailed)) {
    const agentVerdict = await runAgentReview(brief, ctx, opts.agentOptions);
    agentFindings = agentVerdict.findings.filter((f) => f.id !== 'agentic.skipped');
  }

  const verdict = mergeVerdicts(programmatic.findings, agentFindings);
  if (!verdict.summary) {
    verdict.summary = programmaticFailed
      ? 'Programmatic MDCP checks failed.'
      : verdict.pass
        ? 'MDCP merge gate passed.'
        : 'MDCP merge gate found issues.';
  }

  const primaryIssue = programmatic.linkedIssues[0];
  for (const f of verdict.findings) {
    if (f.remediation?.agent && primaryIssue) {
      f.remediation.agent.workItem = String(primaryIssue);
    }
  }

  let commented = false;
  if (
    opts.comment !== false &&
    (!verdict.pass || process.env.MDCP_REVIEW_COMMENT_ON_PASS === '1')
  ) {
    const pr = await fetchPullRequest(review.owner, review.repo, review.prNumber);
    const body = formatReviewComment(verdict, pr.url);
    await upsertPullRequestComment(review.owner, review.repo, review.prNumber, body);
    commented = true;
  }

  return { verdict, brief, commented };
}
