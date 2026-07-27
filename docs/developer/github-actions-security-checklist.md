# GitHub Actions security checklist

This checklist tracks our compliance with the [OWASP GitHub Actions Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GitHub_Actions_Security_Cheat_Sheet.html). See [GitHub Actions security posture](./github-actions-security.md) for vocabulary and re-review guidance. All open risks are tracked under epic [#173](https://github.com/betsalel-williamson/mdcp/issues/173).

| OWASP Topic                        | Status                                                                       | Notes                                            |
| ---------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| **Authentication & Authorization** |                                                                              |                                                  |
| Default `GITHUB_TOKEN` permissions | `reviewed (2026-07-27)`                                                      | Repo default is read-only.                       |
| Workflow-level `permissions: {}`   | `open risk ([#177](https://github.com/betsalel-williamson/mdcp/issues/177))` | Missing on `ci.yml` and `gitleaks.yml`.          |
| `persist-credentials: false`       | `open risk ([#178](https://github.com/betsalel-williamson/mdcp/issues/178))` | Missing on `actions/checkout` steps.             |
| OIDC for cloud providers           | `reviewed (2026-07-27)`                                                      | Used for npm Trusted Publishing.                 |
| Secrets: inherit                   | `not a concern (2026-07-27)`                                                 | Not used.                                        |
| **Workflows & Execution**          |                                                                              |                                                  |
| Pin actions to commit SHA          | `open risk ([#175](https://github.com/betsalel-williamson/mdcp/issues/175))` | Currently using mutable tags (`@v7`, etc.).      |
| Third-party actions caution        | `reviewed (2026-07-27)`                                                      | Documented current set.                          |
| Unused dangerous triggers          | `not a concern (2026-07-27)`                                                 | No `pull_request_target`, `workflow_run`, etc.   |
| Multi-repo shared workflows        | `not a concern (2026-07-27)`                                                 | Not used.                                        |
| **Runners & Environments**         |                                                                              |                                                  |
| Self-hosted runners                | `not a concern (2026-07-27)`                                                 | Using `ubuntu-latest` GitHub-hosted runners.     |
| Runner groups                      | `not a concern (2026-07-27)`                                                 | Not applicable to GitHub-hosted runners.         |
| Egress monitoring                  | `open risk ([#179](https://github.com/betsalel-williamson/mdcp/issues/179))` | Harden-Runner not implemented.                   |
| Environment required reviewers     | `open risk ([#180](https://github.com/betsalel-williamson/mdcp/issues/180))` | Release environment needs manual approval.       |
| **Code & Supply Chain**            |                                                                              |                                                  |
| Branch protection baseline         | `reviewed (2026-07-27)`                                                      | Main branch protected with PR and status checks. |
| Require approval for external      | `open risk ([#182](https://github.com/betsalel-williamson/mdcp/issues/182))` | Missing CODEOWNERS and approval requirement.     |
| Dependabot for Actions             | `reviewed (2026-07-27)`                                                      | Configured for weekly updates.                   |
| Dependabot cooldown                | `open risk ([#181](https://github.com/betsalel-williamson/mdcp/issues/181))` | Missing cooldown period for actions ecosystem.   |
| Secret scanning                    | `reviewed (2026-07-27)`                                                      | Gitleaks workflow is active.                     |
| Static analysis (CodeQL/Zizmor)    | `open risk ([#174](https://github.com/betsalel-williamson/mdcp/issues/174))` | Missing workflow and code scanning.              |
| AI-in-CI                           | `not a concern (2026-07-27)`                                                 | No AI assistants used in CI.                     |
| **Incident Response**              |                                                                              |                                                  |
| Incident response plan             | `reviewed (2026-07-27)`                                                      | Covered in `SECURITY.md` and triage docs.        |
