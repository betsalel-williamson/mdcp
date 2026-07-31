/** Natural-language pack for compiled prose and semantic refs (not GFM structure). */
export interface LocalePack {
  /** BCP 47 language tag (for example `en-US`). */
  readonly id: string;

  readonly brokenLinks: LocaleBrokenLinkCopy;
  readonly inserts: LocaleInsertCopy;

  /**
   * Semantic chapter key parts from a heading title (e.g. `ADM Chapter 1` →
   * `{ prefix: 'ADM', number: '1' }`), or null when the title does not match.
   */
  chapterKeyFromTitle(title: string): { prefix: string; number: string } | null;
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

/** Broken-link locale messages before formatter helpers are attached. */
export interface LocaleBrokenLinkMessages {
  readonly markerLabel: string;
  readonly markerTemplate: string;
  readonly reasonDeadAnchor: string;
  readonly reasonMissingFile: string;
  readonly reasonMissingPublishPath: string;
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

/** Inline-insert locale messages before formatter helpers are attached. */
export interface LocaleInsertMessages {
  /** Fallback link text when a back-link has an empty label. */
  readonly seeInsertFallback: string;
}
