import type { MdcpConfig } from '../config/schema.js';

export interface LlmExportOptions {
  stripHtmlComments?: boolean;
  stripFrontmatter?: boolean;
  stripBanner?: boolean;
  collapseBlankLines?: boolean;
}

export function stripForLlm(text: string, opts: LlmExportOptions = {}): string {
  let out = text;

  if (opts.stripFrontmatter !== false) {
    out = out.replace(/^---[\s\S]*?---\n*/m, '');
  }

  if (opts.stripHtmlComments !== false) {
    out = out.replace(/<!--[\s\S]*?-->\n*/g, '');
  }

  if (opts.stripBanner !== false) {
    out = out.replace(/^<!-- AUTO-GENERATED[\s\S]*?-->\n*/m, '');
  }

  if (opts.collapseBlankLines !== false) {
    out = out.replace(/\n{3,}/g, '\n\n');
  }

  return out.trim() + '\n';
}

export function getLlmExportOptions(config: MdcpConfig): LlmExportOptions {
  return config.export?.llm ?? {};
}
