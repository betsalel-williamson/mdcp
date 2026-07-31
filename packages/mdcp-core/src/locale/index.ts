/**
 * Locale packs: natural-language opinion for linting and compiled prose.
 *
 * Modeled on Vale’s multi-language docs pattern (errata-ai/vale):
 * - GFM / markup structure stays language-neutral (`../markdown/`, links, slugs).
 * - Language-specific grammar/static-analysis cues live in a pack folder
 *   (like a Vale `En` / `en-US` style package), not beside ATX parsers.
 * - A second language adds another pack (and, for peer Vale, another style +
 *   `.vale.ini` glob section) — it does not fork the Markdown engine.
 *
 * @see docs/features/design-constraints/locale-and-language.md
 */

export type {
  LocaleBrokenLinkCopy,
  LocaleInsertCopy,
  LocalePack,
  LocaleXrefPatterns,
} from './types.js';
export { enUS } from './en-US/index.js';
export { DEFAULT_LOCALE_ID, getLocalePack, listLocalePackIds } from './resolve.js';
