# GitHub Actions security posture

Maintainer guide for tracking **GitHub Actions security posture** in this public OSS monorepo. Vulnerability **reporting** stays in [SECURITY.md](../../SECURITY.md); dependency and release triage stays in [Security-incident triage](./security-incident-triage.md). This shard is the audit trail for CI workflow and repository settings against the [OWASP GitHub Actions Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GitHub_Actions_Security_Cheat_Sheet.html).

Work is tracked under epic [#173 — Repository security posture](https://github.com/betsalel-williamson/mdcp/issues/173). The durable checklist lives in [#168 — OWASP GitHub Actions security checklist docs](https://github.com/betsalel-williamson/mdcp/issues/168); see [GitHub Actions security checklist](./github-actions-security-checklist.md) for row-by-row status.

## Status vocabulary

Each checklist row uses **exactly one** of these statuses (normative):

| Status                       | Meaning                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `reviewed (YYYY-MM-DD)`      | Topic assessed against current repo state on that date; controls in place or accepted with documented rationale                |
| `not a concern (YYYY-MM-DD)` | OWASP topic does not apply to this repo (e.g. no self-hosted runners)                                                          |
| `open risk (#N)`             | Gap remains; `#N` is a **remediation issue** that is a child of [#173](https://github.com/betsalel-williamson/mdcp/issues/173) |

Do not invent alternate labels. When a risk closes, update the row to `reviewed` or `not a concern` with the resolution date.

## Re-review cadence

Re-run the checklist when any of the following change:

- Workflow files under `.github/workflows/` (triggers, permissions, action versions, secrets usage)
- Repository or organization **Actions** settings (default `GITHUB_TOKEN` permissions, allowed actions, environments)
- Branch protection, rulesets, or required checks that gate merges and releases
- Dependabot or secret-scanning configuration
- Release mechanics ([Publishing](./publishing.md) — OIDC, environments, npm trust)

Even when nothing changes, schedule a **periodic pass** (for example quarterly) so third-party action advisories and OWASP guidance updates do not drift unnoticed.

## Static analysis

We run **CodeQL** and **Zizmor** on push and pull request. Zizmor checks our workflow files for security misconfigurations and surfaces annotations. CodeQL provides SAST for our JavaScript/TypeScript code.

## Related docs

- [SECURITY.md](../../SECURITY.md) — reporting and maintainer security practices
- [Security-incident triage](./security-incident-triage.md) — dependency advisories and release remediation
- [Publishing](./publishing.md) — npm publish mechanics and Trusted Publishing (OIDC)
- [GitHub Actions security checklist](./github-actions-security-checklist.md) — OWASP topic checklist with as-built status
