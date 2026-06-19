import GithubSlugger, { slug as githubSlug } from 'github-slugger';

/**
 * Strip mdcp heading adornments before slugging.
 * github-slugger expects plain visible text (html-pipeline `node.text`), not raw Markdown.
 */
export function headingTextToPlain(text: string): string {
  return text
    .trim()
    .replace(/\{#.*?\}/g, '')
    .replace(/[*_`]/g, '')
    .trim();
}

/** GitHub heading slug via github-slugger (html-pipeline TableOfContentsFilter algorithm). */
export function githubSlugify(text: string): string {
  return githubSlug(headingTextToPlain(text));
}

const HEADING_RE = /^(#{1,6})\s+(.+)$/;

export interface HeadingEntry {
  key: string | null;
  slug: string;
  title: string;
  guide: string;
  sourceFile: string | null;
  level: number;
  line: number;
}

export interface RefsRegistry {
  generatedFrom: string;
  headings: HeadingEntry[];
  slugs: Record<string, string>;
}

const CHAPTER_KEY_RE = /^([A-Z]{2,4})\s+Chapter\s+(\d+)/i;

function semanticKey(title: string, guide: string): string | null {
  const m = title.match(CHAPTER_KEY_RE);
  if (m) return `${m[1].toLowerCase()}.ch${m[2]}`;
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return safe ? `${guide}.${safe}` : null;
}

export function buildSlugRegistry(
  compiledText: string,
  sourceMap?: Map<string, string>,
): RefsRegistry {
  const slugger = new GithubSlugger();
  const headings: HeadingEntry[] = [];
  const slugs: Record<string, string> = {};

  let currentGuide = '';

  const lines = compiledText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(HEADING_RE);
    if (!m) continue;

    const level = m[1].length;
    const rawTitle = m[2]
      .replace(/\{#.*?\}/g, '')
      .replace(/\*\*/g, '')
      .trim();
    if (!rawTitle) continue;

    if (level === 1) {
      currentGuide = githubSlugify(rawTitle).slice(0, 32) || 'guide';
    }

    const slug = slugger.slug(headingTextToPlain(rawTitle));

    const key = semanticKey(rawTitle, currentGuide);
    const sourceFile = sourceMap?.get(slug) ?? null;

    headings.push({
      key,
      slug,
      title: rawTitle,
      guide: currentGuide,
      sourceFile,
      level,
      line: i + 1,
    });

    if (key) slugs[slug] = key;
  }

  return { generatedFrom: 'compiled', headings, slugs };
}

export function lookupHeadings(registry: RefsRegistry, query: string): HeadingEntry[] {
  const q = query.toLowerCase();
  return registry.headings.filter(
    (h) =>
      h.title.toLowerCase().includes(q) ||
      h.slug.includes(q) ||
      (h.key?.toLowerCase().includes(q) ?? false),
  );
}
