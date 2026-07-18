# ADR 0005: Zero-trust OIDC bridge for skills.sh audits

- **Status:** Accepted
- **Date:** 2026-07-18
- **Tracking:** [#153](https://github.com/betsalel-williamson/mdcp/issues/153)
- **Depends on:** [ADR 0004](./0004-public-first-skills-audit-sync.md)

## Context

The skills.sh audit API requires a Vercel project OIDC Bearer token (`getVercelOidcToken` / `@vercel/oidc`). GitHub Actions cannot mint that token directly. A bridge is required so scheduled jobs in this repo can read audits without embedding a long-lived skills.sh or shared proxy secret.

Constraints locked with MVP A:

- Hobby / free Vercel cost envelope
- Zero-trust between Actions and the bridge
- Minimal invocations (on the order of tens per week)
- No datastore and no Vercel Cron in MVP (scheduling stays in GitHub Actions)

## Decision

Add a thin Vercel proxy package in this monorepo (`packages/mdcp-skills-audit-proxy`) whose only job is auth gate + OIDC mint + forward.

### Routes

| Proxy route              | Upstream                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `GET /api/skills`        | skills.sh `GET /api/v1/skills/search?owner=betsalel-williamson`, filtered to `source=betsalel-williamson/mdcp` |
| `GET /api/audit/{skill}` | skills.sh `GET /api/v1/skills/audit/betsalel-williamson/mdcp/{skill}`                                          |

### Auth

1. Callers present a GitHub Actions OIDC JWT (`Authorization: Bearer …`).
2. Proxy verifies the JWT against GitHub’s OIDC JWKS and asserts issuer, configured audience (for example `mdcp-skills-audit-proxy`), and repository allowlist `betsalel-williamson/mdcp`.
3. Proxy mints a Vercel OIDC token and calls skills.sh.
4. Responses: `401` missing/invalid token; `403` wrong repository; propagate skills.sh `404` / `429` / `503` (preserve `Retry-After` when present).
5. Never return Vercel OIDC tokens to the client; never log tokens or response bodies.

### Ops

- Enable OIDC Federation on the Vercel project.
- No long-lived skills.sh secret; no shared secret between Actions and the proxy.
- Expect fewer than about 100 invocations per week.

## Consequences

- GitHub Actions need `id-token: write` and the proxy’s public base URL / audience configuration.
- Non-mdcp repositories and unauthenticated callers are denied (verified with a smoke test).
- Issue upsert and triage logic stay in GitHub Actions / scripts in this repo — not in the proxy.
- Local proxy development uses Vercel CLI link / `getVercelOidcToken` refresh; `.env.local` must not be committed.
