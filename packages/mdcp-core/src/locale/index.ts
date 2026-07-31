/**
 * Locale packs: natural-language opinion for linting and compiled prose.
 *
 * GFM / Markdown structure lives under `markdown/`, `links/`, `compile/`, and
 * `refs/` (slug algorithm). Do not put English tokens in those modules — put
 * them here (Vale styles play the same role for peer prose lint).
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
