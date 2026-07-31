/** Natural-language pack for opinionated linting and compiled prose (not GFM structure). */
export interface LocalePack {
  /** BCP 47 language tag (for example `en-US`). */
  readonly id: string;

  readonly xrefs: LocaleXrefPatterns;
  readonly brokenLinks: LocaleBrokenLinkCopy;
  readonly inserts: LocaleInsertCopy;

  /**
   * Semantic chapter key parts from a heading title (e.g. `ADM Chapter 1` →
   * `{ prefix: 'ADM', number: '1' }`), or null when the title does not match.
   */
  chapterKeyFromTitle(title: string): { prefix: string; number: string } | null;
}

/** Cross-reference lint patterns and issue message copy. */
export interface LocaleXrefPatterns {
  /** Bare chapter / Ch. N references. */
  readonly chapterRef: RegExp;
  /** Unlinked "See Chapter N". */
  readonly seeChapter: RegExp;
  /** Capitalized See … that is not already a markdown link. */
  readonly seeCapitalUnlinked: RegExp;
  /** Lowercase see … after ( or ,. */
  readonly seeLowercaseUnlinked: RegExp;
  /** Table cell that is only the cue word (skip). */
  readonly seeTableCell: string;
  /** Line already has a linked See / see. */
  readonly seeLinked: RegExp;

  bareCrossRefMessage(match: string): string;
  unlinkedMessage(match: string): string;
  readonly unlinkedSeeCapitalMessage: string;
  readonly unlinkedSeeLowercaseMessage: string;
}

/** Broken-link marker wording in compiled output. */
export interface LocaleBrokenLinkCopy {
  readonly markerLabel: string;
  readonly reasonDeadAnchor: string;
  readonly reasonMissingFile: string;
  readonly reasonMissingPublishPath: string;
  formatMarker(label: string, originalTarget: string, brokenTarget: string, reason: string): string;
  /** True when a line already contains a broken-link marker. */
  lineHasMarker(line: string): boolean;
}

/** Inline-insert caption wording. */
export interface LocaleInsertCopy {
  /** Display title for an insert kind id (`diagram` → `Diagram`). */
  kindTitle(kind: string): string;
  /** Fallback link text when a back-link has an empty label. */
  readonly seeInsertFallback: string;
  /** Title-case a hyphenated basename for captions. */
  humanizeBasename(basenameWithoutExt: string): string;
}
