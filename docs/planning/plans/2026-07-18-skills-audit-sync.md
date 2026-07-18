# skills.sh Security Audit Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync published skills.sh partner audits into mdcp via a Hobby Vercel OIDC proxy and GitHub Actions, maintaining an in-flight Issue, a committed accepted-risks log, high-urgency Issues, and updated security/developer shards (ADRs 0004–0006, #153).

**Architecture:** GitHub Actions (OIDC) → `packages/mdcp-skills-audit-proxy` (verify GH JWT, mint Vercel OIDC, forward) → skills.sh API. Sync script classifies each finding fingerprint against `security/skills-audit-accepted.yaml` and the in-flight Issue, posts change events only, escalates **high** to dedicated Issues, and enforces ~24h spacing between successful scheduled syncs.

**Tech Stack:** Node 18+ / TypeScript, Vercel serverless (`@vercel/oidc`, `jose` for GH JWKS), Vitest, GitHub Actions (`gh` + Octokit or `fetch` to GitHub API), YAML accepted log (`yaml` package or hand-rolled parse for MVP).

**Spec:** [ADR 0004](../../features/adr/0004-public-first-skills-audit-sync.md), [ADR 0005](../../features/adr/0005-skills-audit-oidc-proxy.md), [ADR 0006](../../features/adr/0006-project-skill-security-audit-issue.md). Tracking: [#153](https://github.com/betsalel-williamson/mdcp/issues/153).

## Global Constraints

- Public skills.sh audits are the reputation source of truth (MVP A); no native CI scanner substitute in this plan.
- Proxy allowlists repository `betsalel-williamson/mdcp` only; never return Vercel OIDC tokens; never log tokens/bodies.
- Hobby/free Vercel; no DB; no Vercel Cron; scheduling stays in GitHub Actions.
- Accepted risks only in `security/skills-audit-accepted.yaml` (git); automation must not invent acceptances.
- In-flight state on one Issue (`priority:P1`, `skill-security`); med/low stay there; **high** gets a dedicated urgency Issue.
- Skip scheduled sync if `last_successful_sync_at` is within the last **24 hours** (not UTC-day); `workflow_dispatch` may override.
- Docs describe **as-built** behavior only; edit shards then `pnpm docs:check`; no hand-edit of compiled DEVELOPERS.md.
- Proxy package is **`private: true`** (not published to npm) — no Changeset required for the proxy itself.
- Plan location for this repo: `docs/planning/plans/` (not `docs/superpowers/`).

---

## File structure (create / modify)

| Path                                                    | Responsibility                                        |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `packages/mdcp-skills-audit-proxy/`                     | Vercel Hobby app: GH OIDC verify + skills.sh forward  |
| `packages/mdcp-skills-audit-proxy/api/skills.ts`        | `GET /api/skills`                                     |
| `packages/mdcp-skills-audit-proxy/api/audit/[skill].ts` | `GET /api/audit/:skill`                               |
| `packages/mdcp-skills-audit-proxy/src/auth.ts`          | Verify GitHub Actions OIDC JWT                        |
| `packages/mdcp-skills-audit-proxy/src/skillsSh.ts`      | Mint Vercel OIDC; call skills.sh                      |
| `scripts/skills-audit-sync/`                            | Classification + GitHub Issue upsert (run in Actions) |
| `security/skills-audit-accepted.yaml`                   | Canonical accepted-risk log                           |
| `.github/workflows/skills-audit-sync.yml`               | Daily / weekly / dispatch triggers                    |
| `docs/developer/skills-audit-sync.md`                   | Maintainer runbook (OIDC, triage, accept log)         |
| `docs/features/skills-audit-sync.md`                    | As-built feature shard (capability + contracts)       |
| `SECURITY.md`                                           | Point to partner-audit sync + reporting unchanged     |
| `docs/developer/versioning-and-releases.md`             | Post-release ~24h audit sync note                     |
| `docs/developer/agent-skill.md`                         | Brief pointer to public audits / register             |
| `docs/developer/repository-layout.md`                   | New package + `security/` + planning path             |
| `docs/developer/packages-and-tests.md`                  | Proxy package test commands                           |
| `docs/developer/index.md` / `docs/features/index.md`    | Link new shards                                       |

**Triage mapping (lock):**

| Condition                                                | Triage                                 |
| -------------------------------------------------------- | -------------------------------------- |
| `status === "fail"` OR `riskLevel` in `HIGH`, `CRITICAL` | **high**                               |
| `status === "warn"` OR `riskLevel === "MEDIUM"`          | **medium**                             |
| Other non-`pass` findings                                | **low**                                |
| `status === "pass"`                                      | not an open risk (may clear in-flight) |

**Fingerprint:** stable string from `{skill, providerSlug, status, summary, riskLevel}` (ignore `auditedAt` alone).

---

### Task 1: Accepted log scaffold + security policy shards (docs-first)

**Files:**

- Create: `security/skills-audit-accepted.yaml`
- Create: `docs/developer/skills-audit-sync.md` (stub runbook: purpose, pointers to ADRs, “implementation in progress” only until Task 6 fills ops — prefer writing full intended process from ADR 0006 so the shard is ready)
- Create: `docs/features/skills-audit-sync.md` (as-built intent from ADRs; mark acceptance criteria; no implementation code)
- Modify: `SECURITY.md` — add “Published skill audits (skills.sh)” section
- Modify: `docs/developer/index.md`, `docs/features/index.md` — link new shards
- Modify: `docs/developer/repository-layout.md` — document `security/`, `packages/mdcp-skills-audit-proxy`, `docs/planning/`
- Modify: `docs/developer/versioning-and-releases.md` — after release, skills.sh audits may lag; daily sync ~20–28h later
- Modify: `docs/developer/agent-skill.md` — short cross-link to feature shard / SECURITY

**Interfaces:**

- Produces: YAML schema for accepted entries used by Task 4:

```yaml
# security/skills-audit-accepted.yaml
version: 1
accepted:
  - fingerprint: 'mdcp-feature-level|snyk|warn|Risk: MEDIUM · …|MEDIUM'
    source:
      skill: mdcp-feature-level
      provider: snyk
      skillsShUrl: https://www.skills.sh/betsalel-williamson/mdcp/mdcp-feature-level/security/snyk
    risk: 'Risk: MEDIUM · …'
    date: '2026-07-18'
    reason: 'False positive; reviewed against skill source'
    accepter: 'maintainer@example.com'
```

- [ ] **Step 1: Add empty accepted log**

Create `security/skills-audit-accepted.yaml`:

```yaml
version: 1
accepted: []
```

- [ ] **Step 2: Author developer runbook shard**

Create `docs/developer/skills-audit-sync.md` covering: ADRs 0004–0006 summary; publish vs cron timelines; classification (accepted / in-flight / new); high → urgent Issue; how to add an accepted entry (required fields); OIDC audience + proxy URL env vars (names only); `workflow_dispatch` override; link to `#153`.

- [ ] **Step 3: Author feature shard**

Create `docs/features/skills-audit-sync.md` with capability, contracts (proxy routes, fingerprint, triage table), acceptance criteria matching ADR success metrics. No source code samples of the proxy.

- [ ] **Step 4: Update SECURITY.md + indexes + layout + release/skill shards**

In `SECURITY.md` under Maintainer practices (or new section), document that published skill partner audits on skills.sh are synced into the in-flight Issue / accepted log — link `docs/developer/skills-audit-sync.md` and ADR 0006. Keep vulnerability **reporting** path unchanged (private advisories).

Wire `index.md` links; update repository layout tree; add a bullet under versioning release checklist about post-release audit lag + sync; add one paragraph in agent-skill publishing section pointing at the feature shard.

- [ ] **Step 5: Validate docs**

Run: `pnpm docs:check`  
Expected: pass

- [ ] **Step 6: Commit**

```bash
git add security/skills-audit-accepted.yaml docs/developer/skills-audit-sync.md docs/features/skills-audit-sync.md SECURITY.md docs/developer/index.md docs/features/index.md docs/developer/repository-layout.md docs/developer/versioning-and-releases.md docs/developer/agent-skill.md
git commit -m "$(cat <<'EOF'
docs(security): skills.sh audit sync shards and accepted log scaffold

Add developer/feature runbook shards, SECURITY.md pointer, and empty
accepted-risks YAML so implementation can classify against a real path.
EOF
)"
```

---

### Task 2: Proxy package scaffold + fingerprint-free auth unit tests

**Files:**

- Create: `packages/mdcp-skills-audit-proxy/package.json` (`private: true`, name `@bwilliamson/mdcp-skills-audit-proxy`)
- Create: `packages/mdcp-skills-audit-proxy/tsconfig.json` (align with other packages: NodeNext / ES2022)
- Create: `packages/mdcp-skills-audit-proxy/vercel.json`
- Create: `packages/mdcp-skills-audit-proxy/src/auth.ts`
- Create: `packages/mdcp-skills-audit-proxy/src/config.ts`
- Create: `packages/mdcp-skills-audit-proxy/test/auth.test.ts`
- Modify: `docs/developer/packages-and-tests.md` — document proxy filter + vitest command

**Interfaces:**

- Produces:

```typescript
// packages/mdcp-skills-audit-proxy/src/config.ts
export const ALLOWED_REPOSITORY = 'betsalel-williamson/mdcp';
export const OIDC_AUDIENCE = process.env.OIDC_AUDIENCE ?? 'mdcp-skills-audit-proxy';
export const SKILLS_SH_BASE = 'https://skills.sh';
export const SKILLS_SOURCE = 'betsalel-williamson/mdcp';

// packages/mdcp-skills-audit-proxy/src/auth.ts
export type GitHubOidcClaims = {
  iss: string;
  aud: string | string[];
  repository: string;
  sub: string;
};
export async function verifyGitHubActionsOidc(
  authorizationHeader: string | null,
  opts?: { jwks?: ReturnType<typeof createRemoteJWKSet>; now?: number },
): Promise<GitHubOidcClaims>;
// throws AuthError with status 401 | 403
```

- [ ] **Step 1: Write failing auth tests**

```typescript
// packages/mdcp-skills-audit-proxy/test/auth.test.ts
import { describe, it, expect } from 'vitest';
import { verifyGitHubActionsOidc } from '../src/auth.js';

describe('verifyGitHubActionsOidc', () => {
  it('rejects missing Authorization', async () => {
    await expect(verifyGitHubActionsOidc(null)).rejects.toMatchObject({
      status: 401,
    });
  });

  it('rejects wrong repository claim', async () => {
    // Use a locally signed test JWT + injected JWKS mock (jose generateKeyPair)
    // claims: repository = "evil/other", aud = "mdcp-skills-audit-proxy"
    await expect(verifyGitHubActionsOidc(`Bearer ${tokenForWrongRepo}`)).rejects.toMatchObject({
      status: 403,
    });
  });
});
```

- [ ] **Step 2: Run tests — expect fail**

Run: `pnpm --filter @bwilliamson/mdcp-skills-audit-proxy test`  
Expected: FAIL (package/scripts missing or auth undefined)

- [ ] **Step 3: Scaffold package + implement auth**

`package.json` scripts: `test` (vitest), `typecheck`, `build` if needed for Vercel. Dependencies: `jose`, `@vercel/oidc`. Implement `verifyGitHubActionsOidc` with issuer `https://token.actions.githubusercontent.com`, audience from config, repository allowlist.

- [ ] **Step 4: Run tests — expect pass**

Run: `pnpm --filter @bwilliamson/mdcp-skills-audit-proxy test`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/mdcp-skills-audit-proxy docs/developer/packages-and-tests.md
git commit -m "$(cat <<'EOF'
feat(skills-audit-proxy): scaffold package and GitHub OIDC verify

Private Vercel proxy package with allowlisted repository checks and
unit tests for 401/403 auth failures.
EOF
)"
```

---

### Task 3: Proxy routes — list skills + audit forward

**Files:**

- Create: `packages/mdcp-skills-audit-proxy/src/skillsSh.ts`
- Create: `packages/mdcp-skills-audit-proxy/api/skills.ts`
- Create: `packages/mdcp-skills-audit-proxy/api/audit/[skill].ts`
- Create: `packages/mdcp-skills-audit-proxy/test/skillsSh.test.ts` (mock `fetch` + mock `getVercelOidcToken`)
- Create: `packages/mdcp-skills-audit-proxy/README.md` (deploy: `vercel link`, OIDC Federation on, env `OIDC_AUDIENCE`)

**Interfaces:**

```typescript
// packages/mdcp-skills-audit-proxy/src/skillsSh.ts
export type SkillListItem = { id: string; slug: string; url: string };
export async function listMdcpSkills(): Promise<SkillListItem[]>;
export async function fetchSkillAudit(skill: string): Promise<Response>;
// Uses getVercelOidcToken(); GET search?owner=betsalel-williamson; filter source === SKILLS_SOURCE
```

- [ ] **Step 1: Write failing tests for filter + status propagation**

```typescript
it('filters search results to betsalel-williamson/mdcp only', async () => {
  // mock fetch returning mixed sources
  const items = await listMdcpSkills();
  expect(items.every((i) => i.id.startsWith('betsalel-williamson/mdcp/'))).toBe(true);
});

it('propagates 404 from skills.sh audit', async () => {
  // mock 404
  const res = await fetchSkillAudit('missing-skill');
  expect(res.status).toBe(404);
});
```

- [ ] **Step 2: Run — expect fail**

Run: `pnpm --filter @bwilliamson/mdcp-skills-audit-proxy test`  
Expected: FAIL on missing exports

- [ ] **Step 3: Implement skillsSh + API handlers**

Handlers: call `verifyGitHubActionsOidc` first; on success call skills.sh; return JSON or status. Never include `Authorization` upstream token in response. Map `Retry-After` through on 429.

- [ ] **Step 4: Tests pass + typecheck**

Run: `pnpm --filter @bwilliamson/mdcp-skills-audit-proxy test && pnpm --filter @bwilliamson/mdcp-skills-audit-proxy typecheck`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/mdcp-skills-audit-proxy
git commit -m "$(cat <<'EOF'
feat(skills-audit-proxy): forward skills list and audit endpoints

Expose /api/skills and /api/audit/:skill gated by GitHub OIDC and
backed by Vercel OIDC to skills.sh.
EOF
)"
```

---

### Task 4: Sync library — fingerprint, classify, spacing

**Files:**

- Create: `scripts/skills-audit-sync/package` layout OR plain `scripts/skills-audit-sync/*.mjs` + vitest under `scripts/skills-audit-sync/test/` — prefer TypeScript in `scripts/skills-audit-sync/` run via `pnpm exec tsx` if that matches repo norms; otherwise compile-free `.mjs` with tests in vitest node environment.
- Create: `scripts/skills-audit-sync/fingerprint.ts`
- Create: `scripts/skills-audit-sync/classify.ts`
- Create: `scripts/skills-audit-sync/acceptedLog.ts`
- Create: `scripts/skills-audit-sync/spacing.ts`
- Create: `scripts/skills-audit-sync/test/*.test.ts`

**Interfaces:**

```typescript
export function fingerprint(input: {
  skill: string;
  providerSlug: string;
  status: string;
  summary: string;
  riskLevel?: string;
}): string;

export type Triage = 'high' | 'medium' | 'low';
export function triageFinding(f: { status: string; riskLevel?: string }): Triage | null; // null if pass

export type Class = { kind: 'accepted' } | { kind: 'in_flight' } | { kind: 'new'; triage: Triage };

export function classifyFinding(
  fp: string,
  finding: { status: string; riskLevel?: string },
  ctx: { acceptedFingerprints: Set<string>; inFlightFingerprints: Set<string> },
): Class;

export function shouldSkipScheduledSync(
  lastSuccessfulSyncAt: string | null,
  now: Date,
  minIntervalMs?: number, // default 24 * 60 * 60 * 1000
): boolean;
```

- [ ] **Step 1: Write failing unit tests** for fingerprint stability (auditedAt ignored), triage table, classify three branches, spacing true/false around 24h boundary

- [ ] **Step 2: Run — expect fail**

- [ ] **Step 3: Implement modules + load YAML accepted log into `Set` of fingerprints**

- [ ] **Step 4: Tests pass**

- [ ] **Step 5: Commit**

```bash
git add scripts/skills-audit-sync
git commit -m "$(cat <<'EOF'
feat(skills-audit-sync): classify findings and enforce 24h spacing

Pure sync helpers for fingerprint, triage, accepted/in-flight/new
classification, and scheduled-run spacing.
EOF
)"
```

---

### Task 5: Sync CLI + GitHub Issue upsert + workflow

**Files:**

- Create: `scripts/skills-audit-sync/run.ts` (or `.mjs`) — entrypoint
- Create: `scripts/skills-audit-sync/github.ts` — Issues API helpers
- Create: `.github/workflows/skills-audit-sync.yml`
- Modify: root `package.json` — optional script `"skills-audit:sync": "tsx scripts/skills-audit-sync/run.ts"`

**Interfaces:**

```typescript
// github.ts
export async function findInFlightIssue(): Promise<{ number: number; body: string } | null>;
export async function upsertInFlightBody(body: string): Promise<void>;
export async function postChangeComment(issueNumber: number, markdown: string): Promise<void>;
export async function upsertHighUrgencyIssue(input: {
  fingerprint: string;
  skill: string;
  title: string;
  body: string;
}): Promise<number>;
```

Workflow sketch:

```yaml
name: skills-audit-sync
on:
  schedule:
    - cron: '0 15 * * 1' # weekly candidate
    - cron: '0 3 * * *' # daily post-release window check
  workflow_dispatch:
    inputs:
      force:
        description: 'Ignore 24h spacing'
        type: boolean
        default: false
permissions:
  contents: read
  issues: write
  id-token: write
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v6
        with:
          node-version: 24
      # obtain ACTIONS_ID_TOKEN_REQUEST_TOKEN audience = mdcp-skills-audit-proxy
      - run: pnpm install --frozen-lockfile
      - run: pnpm skills-audit:sync
        env:
          SKILLS_AUDIT_PROXY_URL: ${{ vars.SKILLS_AUDIT_PROXY_URL }}
          SKILLS_AUDIT_OIDC_AUDIENCE: mdcp-skills-audit-proxy
          SKILLS_AUDIT_FORCE: ${{ inputs.force }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Entrypoint behavior:

1. Unless `SKILLS_AUDIT_FORCE`, skip if spacing says so (read `last_successful_sync_at` from in-flight Issue body meta marker).
2. Daily trigger: if no Release published in 20–28h window **and** event is daily-only path, exit 0 without counting as success sync (do not update `last_successful_sync_at`). Weekly always attempts full sync subject to spacing.
3. OIDC: request token with audience `mdcp-skills-audit-proxy`; `GET ${PROXY}/api/skills` then each `/api/audit/{slug}`.
4. Load accepted YAML; parse in-flight fingerprints from Issue body.
5. Classify each audit entry; update body; comment only on deltas; open/update high Issues.
6. On hard proxy 401/403: fail job. On per-skill 404: note pending; continue. On full success: write `last_successful_sync_at`.

- [ ] **Step 1: Implement github helpers with tests against mocked `fetch`**

- [ ] **Step 2: Implement run.ts wiring**

- [ ] **Step 3: Add workflow YAML + package script**

- [ ] **Step 4: Dry-run locally with mocked proxy** (unit/integration test of run with injected clients)

- [ ] **Step 5: Commit**

```bash
git add scripts/skills-audit-sync .github/workflows/skills-audit-sync.yml package.json
git commit -m "$(cat <<'EOF'
feat(skills-audit-sync): GitHub Actions workflow and Issue upsert

Wire proxy fetch, classification, in-flight/high Issues, and ~24h
scheduled spacing into the skills-audit-sync workflow.
EOF
)"
```

---

### Task 6: Deploy proxy + finalize runbook (ops)

**Files:**

- Modify: `docs/developer/skills-audit-sync.md` — fill exact env var names, Vercel project steps, label creation (`skill-security`), how to accept (edit YAML PR), how high Issues are titled
- Modify: `docs/features/skills-audit-sync.md` — confirm as-built matches shipped behavior (remove any “planned” wording)
- Modify: ADR 0006 accepted path example → lock `security/skills-audit-accepted.yaml` if not already exact

**Manual / ops steps (human):**

- [ ] **Step 1: Create Vercel project** from `packages/mdcp-skills-audit-proxy`, enable OIDC Federation, deploy production URL
- [ ] **Step 2: Set repo Actions variable** `SKILLS_AUDIT_PROXY_URL` to that URL; ensure audience matches
- [ ] **Step 3: Create labels** `skill-security` (and reuse `priority:P1`) on the repo if missing
- [ ] **Step 4: Run `workflow_dispatch` with `force: true` once**; confirm in-flight Issue created and proxy 401 from curl without token
- [ ] **Step 5: Update runbook shard with the real URL pattern (no secrets) + commit**

```bash
git add docs/developer/skills-audit-sync.md docs/features/skills-audit-sync.md docs/features/adr/0006-project-skill-security-audit-issue.md
git commit -m "$(cat <<'EOF'
docs(developer): finalize skills audit sync runbook after deploy

Record OIDC audience, proxy variable, labels, and accept-log workflow
now that the Vercel bridge and Actions job are live.
EOF
)"
```

- [ ] **Step 6: `pnpm docs:check` + `pnpm check` (or at least proxy + sync tests)** — Expected: pass

---

## Self-review (plan vs ADRs)

| ADR requirement                               | Task   |
| --------------------------------------------- | ------ |
| MVP A public-first                            | 3–5    |
| OIDC proxy allowlist                          | 2–3, 6 |
| In-flight Issue + accepted YAML + high Issues | 1, 4–5 |
| Publish ~20–28h + weekly + 24h spacing        | 4–5    |
| Classification accepted / in-flight / new     | 4–5    |
| Security + developer/feature shards           | 1, 6   |
| No invent accept; human YAML                  | 1, 5–6 |
| Hobby, no Vercel cron                         | 3, 5   |

No `docs/superpowers/` paths. Proxy private. Docs-first Task 1 before code.

---

## Execution handoff

Plan saved to `docs/planning/plans/2026-07-18-skills-audit-sync.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks
2. **Inline Execution** — execute tasks in this session with checkpoints

Which approach?
