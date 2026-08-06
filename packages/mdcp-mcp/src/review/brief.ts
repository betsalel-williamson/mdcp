import type { ReviewContext, ReviewFinding, ReviewVerdict } from '../types.js';
import { fetchPullRequest } from '../github/client.js';
import { inferHelperSkill, listChangedFiles } from '../github/pr-context.js';
import { relatedDocShards } from '../review/programmatic.js';
import { verdictFromFindings } from '../review/comment.js';
import { REVIEW_RUBRIC } from '../review/rubric.js';
import { runProgrammaticChecks, type ToolCallContext } from '../tools/registry.js';

export interface ReviewBrief {
  rubric: string;
  context: ReviewContext;
  pr: { title: string; body: string; url: string; linkedIssues: number[] };
  changedFiles: string[];
  relatedDocHints: string[];
  suggestedSkill: string;
  programmaticFindings: ReviewFinding[];
  instructions: string;
}

export async function buildReviewBrief(ctx: ToolCallContext): Promise<ReviewBrief> {
  const pr = await fetchPullRequest(ctx.review.owner, ctx.review.repo, ctx.review.prNumber);
  const changedFiles = listChangedFiles(ctx.review.baseSha, ctx.review.headSha);
  const programmatic = await runProgrammaticChecks(ctx);
  const workItem = pr.linkedIssueNumbers[0];

  return {
    rubric: REVIEW_RUBRIC,
    context: ctx.review,
    pr: {
      title: pr.title,
      body: pr.body,
      url: pr.url,
      linkedIssues: pr.linkedIssueNumbers,
    },
    changedFiles,
    relatedDocHints: relatedDocShards(changedFiles),
    suggestedSkill: inferHelperSkill(changedFiles),
    programmaticFindings: programmatic.findings,
    instructions: [
      'Perform agentic MDCP merge review using mdcp-mcp read-only tools.',
      'Confirm work item scope, docs-first coverage, shard SRP, and guide alignment.',
      workItem
        ? `Primary WORK_ITEM: #${workItem}`
        : 'No linked issue — report work-item.linked as error.',
      `Suggested helper skill: /${inferHelperSkill(changedFiles)}`,
    ].join('\n'),
  };
}

export function mergeVerdicts(
  programmatic: ReviewFinding[],
  agentic: ReviewFinding[],
): ReviewVerdict {
  const byId = new Map<string, ReviewFinding>();
  for (const f of [...programmatic, ...agentic]) {
    byId.set(f.id, f);
  }
  return verdictFromFindings([...byId.values()]);
}
