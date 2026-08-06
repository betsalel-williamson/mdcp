import brokenLinksCopy from '../locales/en-US/brokenLinks.json' with { type: 'json' };
import codeEvidenceCopy from '../locales/en-US/codeEvidence.json' with { type: 'json' };
import headingsCopy from '../locales/en-US/headings.json' with { type: 'json' };
import insertsCopy from '../locales/en-US/inserts.json' with { type: 'json' };
import refsCopy from '../locales/en-US/refs.json' with { type: 'json' };
import { createLocalePack } from '../create-locale-pack.js';

/** Default US-English locale pack for opinionated helpers. */
export const enUS = createLocalePack({
  id: 'en-US',
  brokenLinks: brokenLinksCopy,
  inserts: insertsCopy,
  lineRangeWords: codeEvidenceCopy.lineRangeWords,
  aboutThisGuideTitle: headingsCopy.aboutThisGuideTitle,
  headingKeyPattern: refsCopy.headingKeyPattern,
  headingKeyTemplate: refsCopy.headingKeyTemplate,
});
