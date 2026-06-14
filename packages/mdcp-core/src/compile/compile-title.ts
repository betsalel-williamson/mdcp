export function extractFirstHeading(body: string): {
  text: string | null;
  anchor: string | null;
} {
  const trimmed = body.trimStart();
  const match = trimmed.match(/^#{1,6}\s+(.+?)(?:\s+\{#([a-z0-9-]+)\})?\s*(?:\n|$)/);
  if (!match) return { text: null, anchor: null };
  return { text: match[1].trim(), anchor: match[2] ? match[2].toLowerCase() : null };
}

export function stripFirstHeadingLine(body: string): string {
  const lines = body.split('\n');
  if (lines.length === 0) return body;
  if (/^#{1,6}\s+/.test(lines[0])) {
    return lines.slice(1).join('\n').trimStart();
  }
  return body;
}

export function formatCompileTitle(title: string): string {
  return `## ${title}`;
}
