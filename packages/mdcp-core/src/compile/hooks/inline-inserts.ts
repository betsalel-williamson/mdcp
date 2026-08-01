import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { getLocalePack, type LocalePack } from '../../locale/index.js';
import { githubSlugify } from '../../refs/slugs.js';
import type { CompileHook, CompileHookState, InlineInsertsHookState } from '../hooks.js';
import { hookSearchRoots, resolveRelativeFile } from './path-resolve.js';

/** Paths under shared insert libraries: diagrams/, tables/, figures/, media/, inserts/, etc. */
const INSERT_LIBRARY_DIR = '(?:diagrams?|tables?|figures?|media|inserts?)';

const INSERT_LINK_RE = new RegExp(
  `\\[([^\\]]*)\\]\\((?!https?:)((?:(?:\\.\\./)+|\\./)?${INSERT_LIBRARY_DIR}/[^)#\\s][^)]*\\.md(?:#[^)]+)?)\\)`,
  'gi',
);

const INSERT_KINDS = new Set(['diagram', 'table', 'figure', 'media', 'insert']);

/** Heading level for first inlined insert (GFM anchor target for back-links). */
const INSERT_HEADING_PREFIX = '####';

type InsertLinkRef = { start: number; end: number; label: string; relPath: string };

function createInlineInsertsState(): InlineInsertsHookState {
  return { firstAnchorByPath: new Map(), nextNumberByKind: new Map() };
}

function ensureInlineInsertsState(hookState?: CompileHookState): InlineInsertsHookState {
  if (!hookState) {
    return createInlineInsertsState();
  }
  if (!hookState.inlineInserts) {
    hookState.inlineInserts = createInlineInsertsState();
  }
  return hookState.inlineInserts;
}

export function isInsertLibraryPath(relPath: string): boolean {
  if (/^https?:\/\//i.test(relPath) || !/\.md$/i.test(relPath)) return false;
  INSERT_LINK_RE.lastIndex = 0;
  const matches = INSERT_LINK_RE.test(`[x](${relPath})`);
  INSERT_LINK_RE.lastIndex = 0;
  return matches;
}

function humanizeBasename(resolvedPath: string, locale: LocalePack): string {
  return locale.inserts.humanizeBasename(basename(resolvedPath, '.md'));
}

export function insertKind(resolvedPath: string): string | null {
  const parent = basename(dirname(resolvedPath)).toLowerCase();
  const kind = parent.endsWith('s') ? parent.slice(0, -1) : parent;
  return INSERT_KINDS.has(kind) ? kind : null;
}

function baseTitle(resolvedPath: string, label: string, locale: LocalePack): string {
  return label.trim() || humanizeBasename(resolvedPath, locale);
}

function stripLeadingKind(title: string, kind: string, locale: LocalePack): string {
  const prefix = locale.inserts.kindTitle(kind);
  if (new RegExp(`^${prefix}\\b`, 'i').test(title)) {
    return title
      .slice(prefix.length)
      .trim()
      .replace(/^[.:]\s*/, '');
  }
  return title;
}

/** Caption title without kind prefix or serial number. */
export function insertCaptionTitle(
  resolvedPath: string,
  label = '',
  locale: LocalePack = getLocalePack(),
): string {
  const kind = insertKind(resolvedPath);
  const title = baseTitle(resolvedPath, label, locale);
  if (!kind) return title;
  return stripLeadingKind(title, kind, locale) || humanizeBasename(resolvedPath, locale);
}

/** GFM heading for a first inline — e.g. `Table 1. Status codes` (en-US captions). */
export function numberedInsertHeading(
  resolvedPath: string,
  label: string,
  number: number,
  locale: LocalePack = getLocalePack(),
): string {
  const kind = insertKind(resolvedPath);
  if (!kind) return baseTitle(resolvedPath, label, locale);
  const caption = insertCaptionTitle(resolvedPath, label, locale);
  return `${locale.inserts.kindTitle(kind)} ${number}. ${caption}`;
}

export function insertAnchorSlug(
  resolvedPath: string,
  label = '',
  number = 1,
  locale: LocalePack = getLocalePack(),
): string {
  return githubSlugify(numberedInsertHeading(resolvedPath, label, number, locale));
}

function nextInsertNumber(state: InlineInsertsHookState, kind: string): number {
  const number = state.nextNumberByKind.get(kind) ?? 1;
  state.nextNumberByKind.set(kind, number + 1);
  return number;
}

function readInsertAt(resolvedPath: string): string | null {
  try {
    return readFileSync(resolvedPath, 'utf-8').trim();
  } catch {
    return null;
  }
}

function formatFirstInline(
  resolvedPath: string,
  content: string,
  label: string,
  state: InlineInsertsHookState,
  locale: LocalePack,
): string {
  const kind = insertKind(resolvedPath);
  const heading = kind
    ? numberedInsertHeading(resolvedPath, label, nextInsertNumber(state, kind), locale)
    : baseTitle(resolvedPath, label, locale);
  const anchor = githubSlugify(heading);
  state.firstAnchorByPath.set(resolvedPath, anchor);
  return `\n\n${INSERT_HEADING_PREFIX} ${heading}\n\n${content}\n\n`;
}

function formatBackLink(label: string, anchor: string, locale: LocalePack): string {
  const text = label.trim() || locale.inserts.seeInsertFallback;
  return `[${text}](#${anchor})`;
}

function resolveInsert(
  relPath: string,
  guideDir: string,
  searchRoots: string[],
): { resolvedPath: string; content: string } | null {
  const resolvedPath = resolveRelativeFile(relPath, guideDir, searchRoots);
  if (!resolvedPath) return null;
  const content = readInsertAt(resolvedPath);
  if (!content) return null;
  return { resolvedPath, content };
}

function findInsertLinks(body: string): InsertLinkRef[] {
  INSERT_LINK_RE.lastIndex = 0;
  const refs: InsertLinkRef[] = [];
  for (const match of body.matchAll(INSERT_LINK_RE)) {
    const raw = match[0];
    const index = match.index;
    if (raw === undefined || index === undefined) continue;
    refs.push({
      start: index,
      end: index + raw.length,
      label: match[1],
      relPath: match[2],
    });
  }
  return refs;
}

function replacementForLink(
  ref: InsertLinkRef,
  guideDir: string,
  searchRoots: string[],
  state: InlineInsertsHookState,
  original: string,
  locale: LocalePack,
): string {
  const insert = resolveInsert(ref.relPath, guideDir, searchRoots);
  if (!insert) return original;

  const existing = state.firstAnchorByPath.get(insert.resolvedPath);
  if (existing) {
    return formatBackLink(ref.label, existing, locale);
  }

  return formatFirstInline(insert.resolvedPath, insert.content, ref.label, state, locale);
}

export const inlineInsertsHook: CompileHook = (ctx) => {
  const guideDir = dirname(ctx.sourceFile);
  const searchRoots = hookSearchRoots(ctx, 'inlineInserts');
  const state = ensureInlineInsertsState(ctx.hookState);
  const locale = getLocalePack();
  const refs = findInsertLinks(ctx.body);

  if (!refs.length) return ctx.body;

  const replacements = refs.map((ref) => ({
    start: ref.start,
    end: ref.end,
    text: replacementForLink(
      ref,
      guideDir,
      searchRoots,
      state,
      ctx.body.slice(ref.start, ref.end),
      locale,
    ),
  }));

  let out = ctx.body;
  for (const rep of [...replacements].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, rep.start) + rep.text + out.slice(rep.end);
  }

  return out;
};
