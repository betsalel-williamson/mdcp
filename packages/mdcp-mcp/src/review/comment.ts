import type { ReviewFinding, ReviewVerdict } from '../types.js';
import { REVIEW_COMMENT_MARKER } from '../github/client.js';

export function formatReviewComment(verdict: ReviewVerdict, prUrl?: string): string {
  const errors = verdict.findings.filter((f) => f.severity === 'error');
  const warnings = verdict.findings.filter((f) => f.severity === 'warning');
  const lines: string[] = [REVIEW_COMMENT_MARKER, '## MDCP merge gate — review required', ''];

  if (verdict.pass) {
    lines.push('✅ **Passed** — documentation and work-item checks succeeded.', '');
    if (verdict.summary) lines.push(verdict.summary, '');
    return lines.join('\n');
  }

  lines.push(
    `❌ **Merge blocked** — ${errors.length} error(s)${warnings.length ? `, ${warnings.length} warning(s)` : ''} must be addressed before this PR can merge to \`main\`.`,
    '',
  );
  if (verdict.summary) lines.push(verdict.summary, '');
  if (prUrl) lines.push(`PR: ${prUrl}`, '');

  const byCategory = groupFindings(verdict.findings);
  for (const [category, items] of Object.entries(byCategory)) {
    lines.push(`### ${categoryLabel(category)}`, '');
    for (const f of items) {
      lines.push(`- **${f.title}** (\`${f.id}\`) — ${f.message}`);
    }
    lines.push('');
  }

  lines.push('### Fix without an AI assistant', '');
  let step = 1;
  for (const f of verdict.findings) {
    if (!f.remediation?.manual?.length) continue;
    lines.push(`**${f.title}**`);
    for (const m of f.remediation.manual) {
      lines.push(`${step}. ${m}`);
      step += 1;
    }
    lines.push('');
  }

  const agentHints = verdict.findings.filter((f) => f.remediation?.agent);
  if (agentHints.length > 0) {
    lines.push('### Fix with an existing MDCP helper skill', '');
    const workItem = agentHints[0]?.remediation?.agent?.workItem ?? '<issue-number>';
    lines.push('```text');
    lines.push(`WORK_ITEM=${workItem}`);
    lines.push('WORK_ITEM_LOOKUP=docs/developer/agent-work-item-tracking.md');
    const skill = agentHints.find((f) => f.remediation?.agent?.skill)?.remediation?.agent?.skill;
    if (skill) lines.push(`Invoke: /${skill}`);
    lines.push('```', '');
  }

  lines.push(
    '### Re-run after fixes',
    '',
    '1. Push commits to this PR.',
    '2. Re-add the PR to the merge queue (or re-run the **MDCP Merge Gate** workflow).',
  );

  return lines.join('\n');
}

function groupFindings(findings: ReviewFinding[]): Record<string, ReviewFinding[]> {
  const out: Record<string, ReviewFinding[]> = {};
  for (const f of findings) {
    (out[f.category] ??= []).push(f);
  }
  return out;
}

function categoryLabel(category: string): string {
  switch (category) {
    case 'work-item':
      return 'Work item';
    case 'documentation':
      return 'Documentation association';
    case 'corpus':
      return 'Corpus integration';
    case 'skill':
      return 'Agent skills';
    case 'agentic':
      return 'Agentic review';
    default:
      return category;
  }
}

export function verdictFromFindings(findings: ReviewFinding[]): ReviewVerdict {
  const hasError = findings.some((f) => f.severity === 'error');
  return { pass: !hasError, findings };
}
