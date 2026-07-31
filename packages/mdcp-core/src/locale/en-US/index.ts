import brokenLinksCopy from '../locales/en-US/brokenLinks.json' with { type: 'json' };
import insertsCopy from '../locales/en-US/inserts.json' with { type: 'json' };
import type { LocaleBrokenLinkCopy, LocaleInsertCopy, LocalePack } from '../types.js';

const CHAPTER_KEY_RE = /^([A-Z]{2,4})\s+Chapter\s+(\d+)/i;

const brokenLinks: LocaleBrokenLinkCopy = {
  markerLabel: brokenLinksCopy.markerLabel,
  reasonDeadAnchor: brokenLinksCopy.reasonDeadAnchor,
  reasonMissingFile: brokenLinksCopy.reasonMissingFile,
  reasonMissingPublishPath: brokenLinksCopy.reasonMissingPublishPath,

  formatMarker(label, originalTarget, brokenTarget, reason): string {
    return `**${brokenLinksCopy.markerLabel}:** "${label}" (\`${originalTarget}\`) → \`${brokenTarget}\` (${reason})`;
  },

  lineHasMarker(line: string): boolean {
    return line.includes(`**${brokenLinksCopy.markerLabel}:**`);
  },
};

const inserts: LocaleInsertCopy = {
  kindTitle(kind: string): string {
    return kind.charAt(0).toUpperCase() + kind.slice(1);
  },
  seeInsertFallback: insertsCopy.seeInsertFallback,
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
  brokenLinks,
  inserts,

  chapterKeyFromTitle(title: string) {
    const m = title.match(CHAPTER_KEY_RE);
    if (!m) return null;
    return { prefix: m[1], number: m[2] };
  },
};
