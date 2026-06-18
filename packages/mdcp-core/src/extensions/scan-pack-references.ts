export type ExternalReferenceKind = 'external-url' | 'external-path' | 'upstream-path';

export interface PackExternalReference {
  file: string;
  kind: ExternalReferenceKind;
  match: string;
}

const MARKDOWN_LINK_RE = /!\[[^\]]*\]\(([^)]+)\)|\[[^\]]*\]\(([^)]+)\)/g;
const URL_RE = /https?:\/\/[^\s<>)"]+/g;
const UPSTREAM_SPEC_RE = /\bspec\/extensions\/[^\s)>]*/g;
const UPSTREAM_REPO_PHRASE_RE = /\bin the mdcp repo\b/gi;

function targetFromMarkdownMatch(match: RegExpExecArray): string | undefined {
  return match[1] ?? match[2];
}

/** Scan one fetchable pack file for links and prose that leave the published pack. */
export function scanPackFileReferences(file: string, text: string): PackExternalReference[] {
  const refs: PackExternalReference[] = [];
  const seen = new Set<string>();

  const add = (kind: ExternalReferenceKind, match: string) => {
    const key = `${kind}:${match}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({ file, kind, match });
  };

  for (const match of text.matchAll(MARKDOWN_LINK_RE)) {
    const target = targetFromMarkdownMatch(match);
    if (!target) continue;
    if (/^https?:\/\//i.test(target)) {
      add('external-url', target);
    } else if (target.startsWith('../') || target.startsWith('..\\')) {
      add('external-path', target);
    }
  }

  for (const match of text.matchAll(URL_RE)) {
    add('external-url', match[0]);
  }

  for (const match of text.matchAll(UPSTREAM_SPEC_RE)) {
    add('upstream-path', match[0]);
  }

  for (const match of text.matchAll(UPSTREAM_REPO_PHRASE_RE)) {
    add('upstream-path', match[0]);
  }

  return refs;
}

export function scanPackReferences(files: { filename: string; text: string }[]): {
  selfContained: boolean;
  externalReferences: PackExternalReference[];
} {
  const externalReferences = files.flatMap(({ filename, text }) =>
    scanPackFileReferences(filename, text),
  );
  return {
    selfContained: externalReferences.length === 0,
    externalReferences,
  };
}

export function formatExternalReferenceWarning(
  packId: string,
  packVersion: string,
  count: number,
): string {
  return (
    `Extension pack "${packId}" ${packVersion} contains ${count} external reference(s). ` +
    'Linked content is not part of the published pack and may not have been reviewed.'
  );
}
