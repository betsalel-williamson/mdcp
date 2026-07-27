# @bwilliamson/mdcp-skills-audit-proxy

Private Vercel serverless bridge: GitHub Actions OIDC in, skills.sh audit API out. Day-to-day ops: [skills.sh audit sync](../../docs/developer/skills-audit-sync.md). One-time project creation: [Vercel setup](../../docs/developer/skills-audit-proxy-vercel.md).

## Routes

| Route                    | Auth                    | Upstream                                                              |
| ------------------------ | ----------------------- | --------------------------------------------------------------------- |
| `GET /api/skills`        | GitHub Actions OIDC JWT | skills.sh owner search, filtered to `source=betsalel-williamson/mdcp` |
| `GET /api/audit/{skill}` | GitHub Actions OIDC JWT | skills.sh audit payload for one skill slug                            |

Callers send `Authorization: Bearer <github-actions-oidc-jwt>`. The proxy verifies issuer, audience (`mdcp-skills-audit-proxy`), and repository allowlist, mints a short-lived Vercel OIDC token via `@vercel/oidc`, and forwards to skills.sh. Vercel OIDC tokens and upstream bodies are never returned to callers or logged.

Upstream `404`, `429`, and `503` responses pass through; `Retry-After` is preserved when present.

## Deploy

Follow the dashboard guide: [skills.sh audit proxy — Vercel setup](../../docs/developer/skills-audit-proxy-vercel.md) (Import Git, Framework Other, Root Directory, build/output, env vars, OIDC Federation, GitHub Actions variable).

```bash
cd packages/mdcp-skills-audit-proxy
vercel link
vercel deploy --prod
```

## Local development

```bash
vercel link
vercel env pull   # writes VERCEL_OIDC_TOKEN to .env.local — do not commit
pnpm test
```

`getVercelOidcToken()` refreshes tokens locally when the Vercel CLI is linked.

## Tests

```bash
pnpm --filter @bwilliamson/mdcp-skills-audit-proxy test
```
