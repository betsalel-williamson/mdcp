export {
  parseHeading,
  isHeading,
  formatHeadingAsAtx,
  type Heading,
  type HeadingKind,
} from './heading.js';
export { parseAtxHeading, isAtxHeading, type AtxHeading } from './atx-heading.js';
export { stripPandocAnchors, isSlugChar, splitTrailingPandocAnchor } from './anchors.js';
export { headingTitlePlain } from './heading-plain.js';

/** Language-agnostic GFM helpers (heading recognition, marker cleanup). Locale copy lives under `../locale/`. */
