import type { ReviewFinding, ReviewVerdict } from '../types.js';
import { REVIEW_RUBRIC } from './rubric.js';
import { REVIEW_TOOLS, callReviewTool, type ToolCallContext } from '../tools/registry.js';
import { verdictFromFindings } from './comment.js';
import type { ReviewBrief } from './brief.js';

export interface RunAgentReviewOptions {
  apiKey?: string;
  model?: string;
  maxTurns?: number;
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export async function runAgentReview(
  brief: ReviewBrief,
  ctx: ToolCallContext,
  opts: RunAgentReviewOptions = {},
): Promise<ReviewVerdict> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      pass: true,
      findings: [
        {
          id: 'agentic.skipped',
          severity: 'info',
          category: 'agentic',
          title: 'Agentic review skipped',
          message:
            'Set ANTHROPIC_API_KEY to enable agentic MDCP review in CI. Programmatic checks still apply.',
        },
      ],
      agentic: false,
    };
  }

  const tools = REVIEW_TOOLS.filter((t) => t.access === 'read').map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema,
  }));

  const messages: { role: 'user' | 'assistant'; content: unknown }[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `${REVIEW_RUBRIC}\n\nReview brief:\n${JSON.stringify(brief, null, 2)}\n\nRespond with JSON: {"pass":boolean,"findings":[...]}`,
        },
      ],
    },
  ];

  const maxTurns = opts.maxTurns ?? 8;
  for (let turn = 0; turn < maxTurns; turn += 1) {
    const response = await anthropicRequest(apiKey, opts.model ?? DEFAULT_MODEL, messages, tools);
    const toolUses = extractToolUses(response);
    if (toolUses.length === 0) {
      const text = extractText(response);
      const parsed = parseAgentVerdict(text);
      if (parsed) return { ...parsed, agentic: true };
      return verdictFromFindings([
        {
          id: 'agentic.parse',
          severity: 'warning',
          category: 'agentic',
          title: 'Agent response not parseable',
          message: 'Agent did not return valid verdict JSON.',
        },
      ]);
    }

    messages.push({ role: 'assistant', content: response.content });
    const toolResults: unknown[] = [];
    for (const tu of toolUses) {
      try {
        const result = await callReviewTool(tu.name, tu.input, ctx);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: JSON.stringify(result),
        });
      } catch (e: unknown) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: JSON.stringify({
            error: e instanceof Error ? e.message : String(e),
          }),
          is_error: true,
        });
      }
    }
    messages.push({ role: 'user', content: toolResults });
  }

  return verdictFromFindings([
    {
      id: 'agentic.timeout',
      severity: 'warning',
      category: 'agentic',
      title: 'Agentic review incomplete',
      message: `Agent exceeded ${maxTurns} tool turns without a final verdict.`,
    },
  ]);
}

async function anthropicRequest(
  apiKey: string,
  model: string,
  messages: { role: string; content: unknown }[],
  tools: { name: string; description: string; input_schema: Record<string, unknown> }[],
): Promise<{ content: unknown[] }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system:
        'You are an MDCP documentation reviewer. Use tools read-only. Output final verdict as JSON only.',
      messages,
      tools,
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API error (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as { content: unknown[] };
}

function extractToolUses(response: { content: unknown[] }): {
  id: string;
  name: string;
  input: Record<string, unknown>;
}[] {
  const out: { id: string; name: string; input: Record<string, unknown> }[] = [];
  for (const block of response.content) {
    if (
      typeof block === 'object' &&
      block !== null &&
      (block as { type?: string }).type === 'tool_use'
    ) {
      const b = block as { id: string; name: string; input: Record<string, unknown> };
      out.push({ id: b.id, name: b.name, input: b.input ?? {} });
    }
  }
  return out;
}

function extractText(response: { content: unknown[] }): string {
  return response.content
    .filter(
      (b): b is { type: 'text'; text: string } =>
        typeof b === 'object' && b !== null && (b as { type?: string }).type === 'text',
    )
    .map((b) => b.text)
    .join('\n');
}

function parseAgentVerdict(text: string): ReviewVerdict | null {
  const jsonMatch = text.match(/\{[\s\S]*"findings"[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      pass?: boolean;
      findings?: ReviewFinding[];
      summary?: string;
    };
    if (!Array.isArray(parsed.findings)) return null;
    return {
      pass: parsed.pass ?? !parsed.findings.some((f) => f.severity === 'error'),
      findings: parsed.findings,
      summary: parsed.summary,
      agentic: true,
    };
  } catch {
    return null;
  }
}
