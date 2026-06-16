import type { LinkFailureReason } from './validate.js';

export type LinkSeverity = 'error' | 'warn';

export interface LinkIssue {
  kind: LinkFailureReason;
  file: string;
  line: number;
  label: string;
  originalTarget: string;
  brokenTarget: string;
  guideName?: string;
  shardFile?: string;
  shardLine?: number;
}

export function formatLinkIssue(issue: LinkIssue, severity: LinkSeverity = 'error'): string {
  const prefix = severity === 'warn' ? 'link-warn' : 'link';
  let msg = `${prefix}: ${issue.file}:${issue.line}: ${issue.kind} "${issue.brokenTarget}"`;
  if (issue.guideName) {
    msg += ` (compiled guide "${issue.guideName}")`;
  }
  if (issue.shardFile) {
    msg += `\n  → shard: ${issue.shardFile}:${issue.shardLine ?? '?'} → ${issue.originalTarget}`;
  }
  return msg;
}
