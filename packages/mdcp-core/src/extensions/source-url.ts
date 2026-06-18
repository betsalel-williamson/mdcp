import { buildGithubRawUrl } from '../export/llms-index-fetch.js';
import type { ExtensionSource } from '../config/schema.js';

export interface ResolvedExtensionSource {
  repo: string;
  ref: string;
  baseUrl?: string;
}

export function buildExtensionFileUrl(
  source: ResolvedExtensionSource,
  packPath: string,
  filename: string,
): string {
  const relative = `${packPath.replace(/^\//, '')}/${filename}`;
  if (source.baseUrl) {
    const base = source.baseUrl.replace(/\/$/, '');
    return `${base}/${relative}`;
  }
  return buildGithubRawUrl(source.repo, source.ref, relative);
}

export function normalizeExtensionSource(
  source: ExtensionSource | undefined,
  fallback: ResolvedExtensionSource,
): ResolvedExtensionSource {
  return {
    repo: source?.repo ?? fallback.repo,
    ref: source?.ref ?? fallback.ref,
    baseUrl: source?.baseUrl ?? fallback.baseUrl,
  };
}
