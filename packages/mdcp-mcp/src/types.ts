/** Structured finding from programmatic or agentic MDCP merge review. */
export interface ReviewFinding {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'work-item' | 'documentation' | 'corpus' | 'skill' | 'agentic';
  title: string;
  message: string;
  remediation?: {
    manual: string[];
    agent?: {
      workItem?: string;
      workItemLookup?: string;
      skill?: string;
      prompt?: string;
    };
  };
}

export interface ReviewVerdict {
  pass: boolean;
  findings: ReviewFinding[];
  summary?: string;
  agentic?: boolean;
}

export interface ReviewToolDefinition {
  name: string;
  description: string;
  access: 'read' | 'write';
  domain: 'work-item' | 'code' | 'pr' | 'review';
  inputSchema: Record<string, unknown>;
}

export interface ReviewContext {
  owner: string;
  repo: string;
  prNumber: number;
  baseSha: string;
  headSha: string;
  prTitle?: string;
  prBody?: string;
}

export interface GithubIssueSummary {
  number: number;
  title: string;
  body: string;
  state: string;
  labels: string[];
  url: string;
}

export interface GithubPullSummary {
  number: number;
  title: string;
  body: string;
  state: string;
  baseRef: string;
  headRef: string;
  url: string;
  linkedIssueNumbers: number[];
}
