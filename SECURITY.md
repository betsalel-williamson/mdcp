# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.5.x   | Yes       |
| < 0.5   | No        |

Update this table when a new minor line is published. Versioning policy: [docs/developer/versioning-and-releases.md](docs/developer/versioning-and-releases.md).

## Reporting a vulnerability

Please report security issues privately — do not open a public GitHub issue for undisclosed vulnerabilities.

1. Email the maintainer via [GitHub private vulnerability reporting](https://github.com/betsalel-williamson/mdcp/security/advisories/new) if enabled, or open a minimal issue asking for a private contact channel.
2. Include steps to reproduce, impact assessment, and any suggested fix.
3. Expect an initial response within 7 days.

We follow coordinated disclosure: we will confirm receipt, work on a fix, and publish an advisory before public details when possible.

## Published skill partner audits (skills.sh)

MDCP publishes Agent Skills to [skills.sh](https://skills.sh/betsalel-williamson/mdcp). Security partners publish audits on those skill pages. That is separate from private vulnerability reporting above — partner findings are already public on skills.sh.

This repository syncs published skills.sh audit results into GitHub Issues and a committed accepted-risks log (`security/skills-audit-accepted.yaml`) so maintainers can triage, fix, or formally accept risk with a durable audit trail. Public skills.sh audits remain the install-time reputation source of truth.

Maintainers: [skills.sh audit sync runbook](docs/developer/skills-audit-sync.md). One-time proxy deploy: [Vercel setup](docs/developer/skills-audit-proxy-vercel.md). Product contracts: [skills.sh audit sync](docs/features/skills-audit-sync.md).

## Maintainer practices

- npm account 2FA (auth-and-writes) for `@bwilliamson/mdcp-*` publishers
- Trusted Publishing (OIDC) for releases — no long-lived publish tokens in CI
- Gitleaks on commit and in CI
- `pnpm audit --audit-level=high` in CI
- Frozen lockfile installs in CI

Triage (prod vs dev-only impact, prefer deprecate over unpublish): [docs/developer/security-incident-triage.md](docs/developer/security-incident-triage.md).
