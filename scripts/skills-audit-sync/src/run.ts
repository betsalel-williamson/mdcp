import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseAuditFindings, parseSkillsList } from './auditParse.js';
import { DEFAULT_ACCEPTED_LOG_PATH } from './config.js';
import { classifyFinding } from './classify.js';
import { fingerprint } from './fingerprint.js';
import {
  createGitHubApiFromEnv,
  findOrCreateInFlightIssue,
  formatChangeComment,
  hasReleaseInDailyWindow,
  listRecentReleases,
  parseInFlightEntries,
  parseIssueMeta,
  postIssueComment,
  renderInFlightIssueBody,
  updateIssueBody,
  upsertUrgentIssue,
  type FetchFn,
  type GitHubApiDeps,
  type InFlightEntry,
} from './github.js';
import { loadAcceptedFingerprints } from './acceptedLog.js';
import {
  assertProxyAuthorized,
  fetchAuditFromProxy,
  fetchSkillsFromProxy,
  getProxyOidcToken,
  ProxyAuthError,
  type ProxyDeps,
} from './proxy.js';
import { shouldSkipScheduledSync } from './spacing.js';
import type { AuditFinding } from './types.js';

export type SyncTrigger = 'daily' | 'weekly' | 'dispatch';

export interface SyncEnv {
  force: boolean;
  trigger: SyncTrigger;
  proxyUrl: string;
  githubToken: string;
  acceptedLogPath: string;
}

export interface SyncDeps {
  env: SyncEnv;
  now?: Date;
  fetchFn?: FetchFn;
  getOidcToken?: () => Promise<string>;
  log?: (message: string) => void;
}

export interface SyncResult {
  exitCode: number;
  skipped: boolean;
  reason?: string;
}

function readAcceptedFingerprints(path: string): Set<string> {
  return loadAcceptedFingerprints(readFileSync(path, 'utf8'));
}

function bumpEntry(entry: InFlightEntry, finding: AuditFinding, nowIso: string): InFlightEntry {
  return {
    ...entry,
    skill: finding.skill,
    providerSlug: finding.providerSlug,
    status: finding.status,
    summary: finding.summary,
    riskLevel: finding.riskLevel,
    lastSeen: nowIso,
  };
}

function entryFromFinding(
  finding: AuditFinding,
  fp: string,
  triage: InFlightEntry['triage'],
  nowIso: string,
  urgentIssueNumber?: number,
): InFlightEntry {
  return {
    fingerprint: fp,
    skill: finding.skill,
    providerSlug: finding.providerSlug,
    status: finding.status,
    summary: finding.summary,
    riskLevel: finding.riskLevel,
    triage,
    lastSeen: nowIso,
    urgentIssueNumber,
  };
}

export async function runSync(deps: SyncDeps): Promise<SyncResult> {
  const log = deps.log ?? console.log;
  const now = deps.now ?? new Date();
  const nowIso = now.toISOString();
  const fetchFn = deps.fetchFn;

  const github = createGitHubApiFromEnv(deps.env.githubToken, fetchFn);
  const proxyDeps: ProxyDeps = {
    baseUrl: deps.env.proxyUrl,
    fetchFn,
    getOidcToken: deps.getOidcToken,
  };

  const inFlightIssue = await findOrCreateInFlightIssue(github);
  const existingMeta = parseIssueMeta(inFlightIssue.body ?? '');
  let entries = parseInFlightEntries(inFlightIssue.body ?? '');

  if (!deps.env.force && shouldSkipScheduledSync(existingMeta.lastSuccessfulSyncAt, now)) {
    log('Skipping sync: last successful sync within 24h spacing window');
    return { exitCode: 0, skipped: true, reason: 'spacing' };
  }

  if (deps.env.trigger === 'daily' && !deps.env.force) {
    const releases = await listRecentReleases(github);
    if (!hasReleaseInDailyWindow(releases, now.getTime())) {
      log('Skipping sync: no v* release published in the 20–28h window');
      return { exitCode: 0, skipped: true, reason: 'daily-window' };
    }
  }

  const oidcToken = await getProxyOidcToken(proxyDeps);
  const skillsResponse = await fetchSkillsFromProxy(proxyDeps, oidcToken);
  assertProxyAuthorized(skillsResponse);
  if (skillsResponse.status < 200 || skillsResponse.status >= 300) {
    throw new Error(`Proxy /api/skills failed (${skillsResponse.status})`);
  }

  const skills = parseSkillsList(skillsResponse.body);
  const accepted = readAcceptedFingerprints(deps.env.acceptedLogPath);
  const comments: string[] = [];
  const pendingSkills: string[] = [];
  let hardError = false;

  const allFindings: AuditFinding[] = [];

  for (const skill of skills) {
    const auditResponse = await fetchAuditFromProxy(proxyDeps, skill.slug, oidcToken);
    if (auditResponse.status === 401 || auditResponse.status === 403) {
      throw new ProxyAuthError(auditResponse.status);
    }
    if (auditResponse.status === 404) {
      pendingSkills.push(skill.slug);
      continue;
    }
    if (auditResponse.status < 200 || auditResponse.status >= 300) {
      hardError = true;
      log(`Hard error fetching audit for ${skill.slug}: HTTP ${auditResponse.status}`);
      continue;
    }

    allFindings.push(...parseAuditFindings(skill.slug, auditResponse.body));
  }

  const inFlightFingerprints = new Set(entries.map((entry) => entry.fingerprint));
  const seenFingerprints = new Set<string>();

  for (const finding of allFindings) {
    const fp = fingerprint(finding);
    seenFingerprints.add(fp);
    const classification = classifyFinding(finding, accepted, inFlightFingerprints);
    const existingIndex = entries.findIndex((entry) => entry.fingerprint === fp);

    if (classification.kind === 'accepted') {
      if (existingIndex >= 0) {
        entries[existingIndex] = bumpEntry(entries[existingIndex], finding, nowIso);
      }
      continue;
    }

    if (classification.kind === 'in_flight') {
      if (existingIndex >= 0) {
        entries[existingIndex] = bumpEntry(entries[existingIndex], finding, nowIso);
      }
      continue;
    }

    const triage = classification.triage;
    if (triage === 'high') {
      const urgentIssue = await upsertUrgentIssue(github, finding, fp);
      const entry = entryFromFinding(finding, fp, triage, nowIso, urgentIssue.number);
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
        inFlightFingerprints.add(fp);
      }
      comments.push(formatChangeComment('new', finding, triage));
      continue;
    }

    const entry = entryFromFinding(finding, fp, triage, nowIso);
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
      inFlightFingerprints.add(fp);
      if (triage !== null) {
        comments.push(formatChangeComment('new', finding, triage));
      }
    }
  }

  for (const entry of entries) {
    if (!seenFingerprints.has(entry.fingerprint)) {
      comments.push(
        formatChangeComment('cleared', {
          skill: entry.skill,
          providerSlug: entry.providerSlug,
          status: entry.status,
          summary: entry.summary,
          riskLevel: entry.riskLevel,
        }),
      );
    }
  }

  entries = entries.filter((entry) => seenFingerprints.has(entry.fingerprint));

  const nextMeta = {
    lastSuccessfulSyncAt: hardError ? existingMeta.lastSuccessfulSyncAt : nowIso,
    auditsPending: pendingSkills,
  };

  await updateIssueBody(github, inFlightIssue.number, renderInFlightIssueBody(nextMeta, entries));

  for (const comment of comments) {
    await postIssueComment(github, inFlightIssue.number, comment);
  }

  if (hardError) {
    return { exitCode: 1, skipped: false, reason: 'partial-failure' };
  }

  log(`Sync complete: ${allFindings.length} findings across ${skills.length} skills`);
  return { exitCode: 0, skipped: false };
}

export function readSyncEnv(env: NodeJS.ProcessEnv = process.env): SyncEnv {
  const proxyUrl = env.SKILLS_AUDIT_PROXY_URL;
  const githubToken = env.GITHUB_TOKEN;
  if (!proxyUrl) {
    throw new Error('SKILLS_AUDIT_PROXY_URL is required');
  }
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const triggerRaw = env.SKILLS_AUDIT_TRIGGER ?? 'weekly';
  const trigger =
    triggerRaw === 'daily' || triggerRaw === 'dispatch' || triggerRaw === 'weekly'
      ? triggerRaw
      : 'weekly';

  return {
    force: env.SKILLS_AUDIT_FORCE === '1' || env.SKILLS_AUDIT_FORCE === 'true',
    trigger,
    proxyUrl,
    githubToken,
    acceptedLogPath: env.SKILLS_AUDIT_ACCEPTED_LOG ?? DEFAULT_ACCEPTED_LOG_PATH,
  };
}

export async function main(): Promise<void> {
  const result = await runSync({ env: readSyncEnv() });
  if (result.exitCode !== 0) {
    process.exitCode = result.exitCode;
  }
}

const isMain =
  typeof process.argv[1] === 'string' && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

export type { GitHubApiDeps };
