/** GitHub-style heading slug (matches common GFM renderers). */
export function githubSlugify(text: string): string {
  const s = text
    .trim()
    .toLowerCase()
    .replace(/\{#.*?\}/g, '')
    .replace(/[*_`]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-$/, '');
  return s;
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
  const slugCounts = new Map<string, number>();
  const headings: HeadingEntry[] = [];
  const slugs: Record<string, string> = {};

  let currentGuide = '';

  for (let i = 0; i < compiledText.split('\n').length; i++) {
    const line = compiledText.split('\n')[i];
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

    const base = githubSlugify(rawTitle);
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const slug = count === 0 ? base : `${base}-${count}`;

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
