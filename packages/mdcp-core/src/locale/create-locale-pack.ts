import type {
  LocaleBrokenLinkCopy,
  LocaleBrokenLinkMessages,
  LocaleInsertCopy,
  LocaleInsertMessages,
  LocalePack,
} from './types.js';

type TemplateVars = Record<string, string | number>;

export interface CreateLocalePackOptions {
  readonly id: string;
  readonly brokenLinks: LocaleBrokenLinkMessages;
  readonly inserts: LocaleInsertMessages;
  readonly chapterKeyPattern?: string;
}

const TEMPLATE_VAR_RE = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;

export function formatTemplate(template: string, vars: TemplateVars): string {
  return template.replace(TEMPLATE_VAR_RE, (match, key: string) => {
    const value = vars[key];
    if (value === undefined) {
      throw new Error(`Missing template variable "${key}" for template "${template}"`);
    }
    return String(value);
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function templateToLineRegex(template: string, fixedVars: TemplateVars): RegExp {
  let pattern = '';
  let lastIndex = 0;

  for (const match of template.matchAll(TEMPLATE_VAR_RE)) {
    const index = match.index ?? 0;
    const key = match[1];
    pattern += escapeRegExp(template.slice(lastIndex, index));
    pattern += key in fixedVars ? escapeRegExp(String(fixedVars[key])) : '.*?';
    lastIndex = index + match[0].length;
  }

  pattern += escapeRegExp(template.slice(lastIndex));
  return new RegExp(pattern, 'u');
}

export function createBrokenLinksCopy(messages: LocaleBrokenLinkMessages): LocaleBrokenLinkCopy {
  const markerLineRe = templateToLineRegex(messages.markerTemplate, {
    markerLabel: messages.markerLabel,
  });

  return {
    markerLabel: messages.markerLabel,
    reasonDeadAnchor: messages.reasonDeadAnchor,
    reasonMissingFile: messages.reasonMissingFile,
    reasonMissingPublishPath: messages.reasonMissingPublishPath,

    formatMarker(label, originalTarget, brokenTarget, reason): string {
      return formatTemplate(messages.markerTemplate, {
        markerLabel: messages.markerLabel,
        label,
        originalTarget,
        brokenTarget,
        reason,
      });
    },

    lineHasMarker(line: string): boolean {
      return markerLineRe.test(line);
    },
  };
}

function upperFirstCodePoint(value: string): string {
  const [first, ...rest] = Array.from(value);
  return first ? `${first.toLocaleUpperCase()}${rest.join('')}` : '';
}

function titleCaseWords(value: string): string {
  return value
    .split(/[-_\s]+/u)
    .filter(Boolean)
    .map(upperFirstCodePoint)
    .join(' ');
}

export function createInsertsCopy(messages: LocaleInsertMessages): LocaleInsertCopy {
  return {
    kindTitle(kind: string): string {
      return titleCaseWords(kind);
    },
    seeInsertFallback: messages.seeInsertFallback,
    humanizeBasename(basenameWithoutExt: string): string {
      return titleCaseWords(basenameWithoutExt);
    },
  };
}

function createChapterKeyFromTitle(
  chapterKeyPattern: string | undefined,
): LocalePack['chapterKeyFromTitle'] {
  if (!chapterKeyPattern) {
    return () => null;
  }

  const chapterKeyRe = new RegExp(chapterKeyPattern, 'iu');
  return (title: string) => {
    const match = chapterKeyRe.exec(title);
    if (!match) return null;

    const prefix = match.groups?.prefix ?? match[1];
    const number = match.groups?.number ?? match[2];
    if (!prefix || !number) return null;

    return { prefix, number };
  };
}

export function createLocalePack(options: CreateLocalePackOptions): LocalePack {
  return {
    id: options.id,
    brokenLinks: createBrokenLinksCopy(options.brokenLinks),
    inserts: createInsertsCopy(options.inserts),
    chapterKeyFromTitle: createChapterKeyFromTitle(options.chapterKeyPattern),
  };
}
