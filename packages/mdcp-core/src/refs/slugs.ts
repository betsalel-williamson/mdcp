import GithubSlugger, { slug as githubSlug } from 'github-slugger';
import { getLocalePack, type LocalePack } from '../locale/index.js';
import { parseAtxHeading, stripPandocAnchors, headingTitlePlain } from '../markdown/index.js';

/**
 * Strip mdcp heading adornments before slugging.
 * github-slugger expects plain visible text (html-pipeline `node.text`), not raw Markdown.
 */
export function headingTextToPlain(text: string): string {
  return headingTitlePlain(text);
}

/** GitHub heading slug via github-slugger (html-pipeline TableOfContentsFilter algorithm). */
export function githubSlugify(text: string): string {
  return githubSlug(headingTextToPlain(text));
}

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

function semanticKey(title: string, guide: string, locale: LocalePack): string | null {
  const chapter = locale.chapterKeyFromTitle(title);
  if (chapter) return `${chapter.prefix.toLowerCase()}.ch${chapter.number}`;
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
  locale: LocalePack = getLocalePack(),
): RefsRegistry {
  const slugger = new GithubSlugger();
  const headings: HeadingEntry[] = [];
  const slugs: Record<string, string> = {};

  let currentGuide = '';

  const lines = compiledText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parsed = parseAtxHeading(line);
    if (!parsed) continue;

    const level = parsed.level;
    const rawTitle = stripPandocAnchors(parsed.title).replace(/\*\*/g, '').trim();
    if (!rawTitle) continue;

    if (level === 1) {
      currentGuide = githubSlugify(rawTitle).slice(0, 32) || 'guide';
    }

    const slug = slugger.slug(headingTextToPlain(rawTitle));

    const key = semanticKey(rawTitle, currentGuide, locale);
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
