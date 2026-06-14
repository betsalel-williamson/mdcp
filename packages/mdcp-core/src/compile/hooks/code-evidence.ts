import { readFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import type { CompileHook } from '../hooks.js';
import { defaultSearchRoots, resolveRelativeFile } from './path-resolve.js';

const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;

const LINE_RANGE_RE =
  /\b(?:L|lines?\s*)?(\d+)\s*[-–—]\s*(?:L)?(\d+)\b|\b(?:L|line\s*)(\d+)\b|:(\d+)\s*[-–—]\s*(\d+)\b|:(\d+)\b/gi;

const SOURCE_EXT_RE =
  /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|rb|php|cs|swift|rules|yaml|yml|json|toml|sh|bash|zsh|sql|graphql|proto|vue|svelte)$/i;

const IDENT_RE = /^[\w$]+$/;

export function isSourcePath(path: string): boolean {
  if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('#')) {
    return false;
  }
  if (path.endsWith('.md')) return false;
  const base = path.split('#')[0].split('?')[0];
  return SOURCE_EXT_RE.test(base) || !base.includes('.');
}

export function formatLineFragment(start: string, end?: string): string {
  if (end && end !== start) return `L${start}-L${end}`;
  return `L${start}`;
}

export function lineRangeFromText(text: string): string | null {
  LINE_RANGE_RE.lastIndex = 0;
  const m = LINE_RANGE_RE.exec(text);
  if (!m) return null;
  if (m[1] && m[2]) return formatLineFragment(m[1], m[2]);
  if (m[3]) return formatLineFragment(m[3]);
  if (m[4] && m[5]) return formatLineFragment(m[4], m[5]);
  if (m[6]) return formatLineFragment(m[6]);
  return null;
}

export function symbolFromLabel(label: string): string | null {
  const stripped = label.replace(/^`+|`+$/g, '').trim();
  if (!stripped || lineRangeFromText(stripped)) return null;
  if (!IDENT_RE.test(stripped)) return null;
  return stripped;
}

function evidenceSearchRoots(scopeRoot?: string): string[] {
  const roots = defaultSearchRoots();
  if (scopeRoot) roots.push(scopeRoot);
  return roots;
}

function lineForSymbol(filePath: string, symbol: string): string | null {
  const text = readFileSync(filePath, 'utf-8');
  const lines = text.split('\n');
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`\\b${escaped}\\b`),
    new RegExp(`\\bfunction\\s+${escaped}\\b`),
    new RegExp(`\\bclass\\s+${escaped}\\b`),
    new RegExp(`\\b(?:const|let|var|export)\\s+${escaped}\\b`),
    new RegExp(`\\b${escaped}\\s*\\(`),
  ];
  for (let i = 0; i < lines.length; i++) {
    if (patterns.some((re) => re.test(lines[i]))) {
      return formatLineFragment(String(i + 1));
    }
  }
  return null;
}

function posixRelative(fromDir: string, toFile: string): string {
  return relative(fromDir, toFile).replace(/\\/g, '/');
}

function outputPathForLink(pathPart: string, resolved: string | null, outputFile?: string): string {
  if (!resolved || !outputFile) return pathPart;
  return posixRelative(dirname(outputFile), resolved);
}

function rewriteEvidenceLink(
  label: string,
  target: string,
  guideDir: string,
  searchRoots: string[],
  outputFile?: string,
): string {
  const [pathPart, fragment] = target.split('#');
  if (!isSourcePath(pathPart)) return `[${label}](${target})`;

  const existingLine = fragment?.match(/^L\d+(?:-L\d+)?$/i);
  if (existingLine) {
    const normalized = fragment.replace(/^l/i, 'L');
    const resolved = resolveRelativeFile(pathPart, guideDir, searchRoots);
    const outPath = outputPathForLink(pathPart, resolved, outputFile);
    return `[${label}](${outPath}#${normalized})`;
  }

  const resolved = resolveRelativeFile(pathPart, guideDir, searchRoots);

  let lineFrag = lineRangeFromText(label) ?? lineRangeFromText(pathPart);
  if (!lineFrag && fragment && !fragment.match(/^L\d/i) && resolved) {
    lineFrag = lineForSymbol(resolved, fragment);
  }
  if (!lineFrag && resolved) {
    const symbol = symbolFromLabel(label);
    if (symbol) lineFrag = lineForSymbol(resolved, symbol);
  }

  if (!lineFrag) return `[${label}](${target})`;

  const outPath = outputPathForLink(pathPart, resolved, outputFile);
  return `[${label}](${outPath}#${lineFrag})`;
}

export const codeEvidenceHook: CompileHook = (ctx) => {
  const guideDir = dirname(ctx.sourceFile);
  const searchRoots = evidenceSearchRoots(ctx.scopeRoot);

  return ctx.body.replace(MD_LINK_RE, (match, label: string, target: string) => {
    if (!isSourcePath(target.split('#')[0])) return match;
    return rewriteEvidenceLink(label, target, guideDir, searchRoots, ctx.outputFile);
  });
};
