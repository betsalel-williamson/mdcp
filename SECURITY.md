# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a vulnerability

Please report security issues privately — do not open a public GitHub issue for undisclosed vulnerabilities.

1. Email the maintainer via [GitHub private vulnerability reporting](https://github.com/betsalel-williamson/mdcp/security/advisories/new) if enabled, or open a minimal issue asking for a private contact channel.
2. Include steps to reproduce, impact assessment, and any suggested fix.
3. Expect an initial response within 7 days.

We follow coordinated disclosure: we will confirm receipt, work on a fix, and publish an advisory before public details when possible.

## Maintainer practices

- npm account 2FA (auth-and-writes) for `@mdcp/*` publishers
- Trusted Publishing (OIDC) for releases — no long-lived publish tokens in CI
- Gitleaks on commit and in CI
- `pnpm audit --audit-level=high` in CI
- Frozen lockfile installs in CI
