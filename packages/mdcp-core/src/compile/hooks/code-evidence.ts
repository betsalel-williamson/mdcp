import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { CompileHook } from '../hooks.js';

const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;

const LINE_RANGE_RE =
  /\b(?:L|lines?\s*)?(\d+)\s*[-–—]\s*(?:L)?(\d+)\b|\b(?:L|line\s*)(\d+)\b|:(\d+)\s*[-–—]\s*(\d+)\b|:(\d+)\b/gi;

const SOURCE_EXT_RE =
  /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|rb|php|cs|swift|rules|yaml|yml|json|toml|sh|bash|zsh|sql|graphql|proto|vue|svelte)$/i;

function isSourcePath(path: string): boolean {
  if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('#')) {
    return false;
  }
  if (path.endsWith('.md')) return false;
  const base = path.split('#')[0].split('?')[0];
  return SOURCE_EXT_RE.test(base) || !base.includes('.');
}

function formatLineFragment(start: string, end?: string): string {
  if (end && end !== start) return `L${start}-L${end}`;
  return `L${start}`;
}

function lineRangeFromText(text: string): string | null {
  LINE_RANGE_RE.lastIndex = 0;
  const m = LINE_RANGE_RE.exec(text);
  if (!m) return null;
  if (m[1] && m[2]) return formatLineFragment(m[1], m[2]);
  if (m[3]) return formatLineFragment(m[3]);
  if (m[4] && m[5]) return formatLineFragment(m[4], m[5]);
  if (m[6]) return formatLineFragment(m[6]);
  return null;
}

function resolveRepoPath(rawPath: string, guideDir: string, searchRoots: string[]): string | null {
  const [filePart] = rawPath.split('#');
  const candidates = [
    resolve(guideDir, filePart),
    ...searchRoots.map((root) => resolve(root, filePart)),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function lineForSymbol(filePath: string, symbol: string): string | null {
  const text = readFileSync(filePath, 'utf-8');
  const lines = text.split('\n');
  const patterns = [
    new RegExp(`\\b${symbol}\\b`),
    new RegExp(`\\bfunction\\s+${symbol}\\b`),
    new RegExp(`\\bclass\\s+${symbol}\\b`),
    new RegExp(`\\b${symbol}\\s*\\(`),
  ];
  for (let i = 0; i < lines.length; i++) {
    if (patterns.some((re) => re.test(lines[i]))) {
      return formatLineFragment(String(i + 1));
    }
  }
  return null;
}

function rewriteEvidenceLink(
  label: string,
  target: string,
  guideDir: string,
  searchRoots: string[],
): string {
  const [pathPart, fragment] = target.split('#');
  if (!isSourcePath(pathPart)) return `[${label}](${target})`;

  const existingLine = fragment?.match(/^L\d+(?:-L\d+)?$/i);
  if (existingLine) {
    const normalized = fragment.replace(/^l/i, 'L');
    return `[${label}](${pathPart}#${normalized})`;
  }

  let lineFrag = lineRangeFromText(label) ?? lineRangeFromText(pathPart);
  if (!lineFrag && fragment && !fragment.match(/^L\d/i)) {
    const resolved = resolveRepoPath(pathPart, guideDir, searchRoots);
    if (resolved) {
      lineFrag = lineForSymbol(resolved, fragment) ?? null;
    }
  }

  if (!lineFrag) return `[${label}](${target})`;
  return `[${label}](${pathPart}#${lineFrag})`;
}

export const codeEvidenceHook: CompileHook = (ctx) => {
  const guideDir = dirname(ctx.sourceFile);
  const searchRoots = [process.cwd(), resolve(process.cwd(), '..')];
  const guideCfg = ctx.config.guides?.find((g) => g.name === ctx.guideName);
  const extraRoots = guideCfg?.compile?.hooksConfig?.codeEvidence?.searchRoots ?? [];
  for (const root of extraRoots) {
    searchRoots.push(resolve(process.cwd(), root));
  }

  return ctx.body.replace(MD_LINK_RE, (match, label: string, target: string) => {
    if (!isSourcePath(target.split('#')[0])) return match;
    return rewriteEvidenceLink(label, target, guideDir, searchRoots);
  });
};
