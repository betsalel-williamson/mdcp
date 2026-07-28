import { stripPandocAnchors } from './anchors.js';

/** Strip anchors and light inline adornments for slugger input (parity with headingTextToPlain). */
export function headingTitlePlain(text: string): string {
  return stripPandocAnchors(text.trim()).replace(/[*_`]/g, '').trim();
}
