import type {
  LocaleBrokenLinkCopy,
  LocaleInsertCopy,
  LocalePack,
  LocaleXrefPatterns,
} from '../types.js';

const CHAPTER_KEY_RE = /^([A-Z]{2,4})\s+Chapter\s+(\d+)/i;

const xrefs: LocaleXrefPatterns = {
  chapterRef: /\b(?:Ch\.?\s*\d+(?:\s*[–—-]\s*[^|.\n]+)?|Chapter\s+\d+(?:\s*[–—-]\s*[^|.\n]+)?)\b/gi,
  seeChapter: /\bSee\s+Chapter\s+\d+\b/gi,
  seeCapitalUnlinked: /\bSee\s+(?!your\s)(?!\[)\w/,
  seeLowercaseUnlinked: /(?<=[(,])\s*see\s+(?!\[)\w/,
  seeTableCell: '| See |',
  seeLinked: /\b[Ss]ee\s+\[/,

  bareCrossRefMessage(match: string): string {
    return `bare cross-ref: ${JSON.stringify(match)}`;
  },
  unlinkedMessage(match: string): string {
    return `unlinked: ${JSON.stringify(match)}`;
  },
  unlinkedSeeCapitalMessage: 'unlinked See reference',
  unlinkedSeeLowercaseMessage: 'unlinked see reference',
};

const MARKER_LABEL = 'BROKEN LINK';

const brokenLinks: LocaleBrokenLinkCopy = {
  markerLabel: MARKER_LABEL,
  reasonDeadAnchor: 'dead anchor in compiled guide',
  reasonMissingFile: 'missing file',
  reasonMissingPublishPath: 'missing publish path',

  formatMarker(label, originalTarget, brokenTarget, reason): string {
    return `**${MARKER_LABEL}:** "${label}" (\`${originalTarget}\`) → \`${brokenTarget}\` (${reason})`;
  },

  lineHasMarker(line: string): boolean {
    return line.includes(`**${MARKER_LABEL}:**`);
  },
};

const inserts: LocaleInsertCopy = {
  kindTitle(kind: string): string {
    return kind.charAt(0).toUpperCase() + kind.slice(1);
  },
  seeInsertFallback: 'See insert',
  humanizeBasename(basenameWithoutExt: string): string {
    return basenameWithoutExt
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  },
};

/** Default US-English locale pack for opinionated helpers. */
export const enUS: LocalePack = {
  id: 'en-US',
  xrefs,
  brokenLinks,
  inserts,

  chapterKeyFromTitle(title: string) {
    const m = title.match(CHAPTER_KEY_RE);
    if (!m) return null;
    return { prefix: m[1], number: m[2] };
  },
};
