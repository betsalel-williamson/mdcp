import { readFileSync, existsSync } from 'node:fs';
import { expandProtocolVersion } from './protocol-version.js';
import type { MdcpConfig } from '../config/schema.js';
import {
  resolveLlmsIndexProfilePath,
  resolveLlmsIndexSpecFile,
  type LlmsIndexProfile,
} from './llms-index-artifacts.js';

export const DEFAULT_LLMS_INDEX_UPSTREAM_REPO = 'betsalel-williamson/mdcp';
export const DEFAULT_LLMS_INDEX_UPSTREAM_REF = 'main';

export interface LlmsIndexUpstreamOptions {
  /** GitHub `owner/repo` (default mdcp upstream). */
  repo?: string;
  /** `main`, `latest` (latest release tag), branch name, or tag (e.g. `v1.0.0`). */
  ref?: string;
  /** Path inside the upstream repo; overrides profile and version defaults. */
  path?: string;
  /** `stable` (`vstable`) or `dev` (`vdev`) symlink under spec/llms-index/. */
  profile?: LlmsIndexProfile;
  protocolVersion?: string;
}

export interface LlmsIndexFetchOptions extends LlmsIndexUpstreamOptions {
  fetch?: typeof fetch;
  /** Read from local spec/llms-index/ instead of GitHub (repo checkout). */
  localRepoRoot?: string;
}

export interface LlmsIndexFetchResult {
  text: string;
  url: string;
  protocolVersion: string;
  ref: string;
}

/** First-line `mdcp-llms-index: {version}` header, or null when missing/invalid. */
export function parseLlmsIndexHeader(text: string): string | null {
  const first = text.split('\n')[0]?.trim() ?? '';
  const match = /^mdcp-llms-index:\s*([\d.]+)\s*$/.exec(first);
  if (!match) return null;
  return expandProtocolVersion(match[1]!);
}

export function resolveUpstreamPath(options: LlmsIndexFetchOptions): string {
  if (options.path) return options.path.replace(/^\//, '');
  if (options.profile) return resolveLlmsIndexProfilePath(options.profile);
  return resolveLlmsIndexProfilePath('stable');
}

export function buildGithubRawUrl(repo: string, ref: string, path: string): string {
  const cleanPath = path.replace(/^\//, '');
  return `https://raw.githubusercontent.com/${repo}/${ref}/${cleanPath}`;
}

async function resolveUpstreamRef(
  repo: string,
  ref: string,
  fetchFn: typeof fetch,
): Promise<string> {
  if (ref !== 'latest') return ref;

  const [owner, name] = repo.split('/');
  if (!owner || !name) {
    throw new Error(`Invalid upstream repo "${repo}" — expected owner/name`);
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${name}/releases/latest`;
  const res = await fetchFn(apiUrl, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'mdcp-cli',
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub releases API ${apiUrl}: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { tag_name?: string };
  if (!data.tag_name) {
    throw new Error(`GitHub releases API ${apiUrl}: response missing tag_name`);
  }
  return data.tag_name;
}

function readLocalLlmsIndexSpec(options: LlmsIndexFetchOptions): LlmsIndexFetchResult {
  const repoRoot = options.localRepoRoot ?? process.cwd();
  const profile = options.profile ?? 'stable';
  const filePath = options.path
    ? resolveLlmsIndexSpecFile(repoRoot, options.path)
    : resolveLlmsIndexSpecFile(repoRoot, profile);
  if (!existsSync(filePath)) {
    throw new Error(`Local llms-index artifact not found: ${filePath}`);
  }
  const text = readFileSync(filePath, 'utf-8');
  const protocolVersion = parseLlmsIndexHeader(text);
  if (!protocolVersion) {
    throw new Error(`Local llms-index artifact missing mdcp-llms-index header: ${filePath}`);
  }
  return {
    text,
    url: filePath,
    protocolVersion,
    ref: 'local',
  };
}

/** Fetch canonical llms-index from local spec artifacts or GitHub raw content. */
export async function fetchLlmsIndexFromUpstream(
  options: LlmsIndexFetchOptions = {},
): Promise<LlmsIndexFetchResult> {
  if (options.localRepoRoot !== undefined) {
    return readLocalLlmsIndexSpec(options);
  }

  const repo = options.repo ?? DEFAULT_LLMS_INDEX_UPSTREAM_REPO;
  const refInput = options.ref ?? DEFAULT_LLMS_INDEX_UPSTREAM_REF;
  const path = resolveUpstreamPath(options);
  const fetchFn = options.fetch ?? fetch;

  const ref = await resolveUpstreamRef(repo, refInput, fetchFn);
  const url = buildGithubRawUrl(repo, ref, path);
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  const protocolVersion = parseLlmsIndexHeader(text);
  if (!protocolVersion) {
    throw new Error(`Fetched file is missing a valid mdcp-llms-index header: ${url}`);
  }

  return { text, url, protocolVersion, ref };
}

export function resolveLlmsIndexFetchOptions(
  config: MdcpConfig | undefined,
  overrides: LlmsIndexUpstreamOptions = {},
): LlmsIndexFetchOptions {
  const upstream = config?.export?.llmsIndex?.upstream;
  return {
    repo: overrides.repo ?? upstream?.repo,
    ref: overrides.ref ?? upstream?.ref,
    path: overrides.path ?? upstream?.path,
    profile: overrides.profile ?? upstream?.profile,
    protocolVersion: config?.protocolVersion,
  };
}
