# Automated updates protocol

When Dependabot, a coding agent, or a future bot may change `main` without surprising two different consumer surfaces: **published npm packages** and **Agent Skills installed from tip of `main`**.

Skills and npm packages version independently ([Versioning and releases](./versioning-and-releases.md)). `npx skills add betsalel-williamson/mdcp` copies [`skills/`](../../skills/) from this repository’s **default branch tip**. npm consumers install `@bwilliamson/mdcp-*` only after a [Release](./publishing.md). Classify the blast radius before opening or merging an automated change.

## Two delivery surfaces

| Surface          | How consumers get it                     | What keeps them safe                                                            |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| **Agent Skills** | Default-branch tip → copy `skills/<id>/` | Vendoring + commit in the consumer repo; next add/update re-pulls tip of `main` |
| **npm packages** | Semver tarball after the Release job     | Lockfile + changelog; `pnpm audit --prod` on this monorepo                      |

Root `devDependencies`, presentation tooling, workspace overrides, and most GitHub Actions pins do **not** change skill file contents. Edits under `skills/` (and release sync of `metadata.version`) **do**. Published-package safety is a Release decision, not a tip-of-main skill install.

## Classify first

1. Run `pnpm audit --prod`. Clean means the finding is not a published-package incident — prefer a Class A workspace override or ignore when no patched release exists ([Security-incident triage](./security-incident-triage.md)).
2. Dirty prod audit, or a change under `packages/mdcp-*/` runtime deps or shipped sources → Class B.
3. Any path under `skills/` → Class C, regardless of audit.

## Blast-radius classes

| Class                         | Typical paths                                                                                             | Tip-of-main skill install?            | Published npm?                         | Auto-update rule                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Monorepo-dev / CI**     | Root `devDependencies`, presentation tooling, workspace `overrides` / audit ignores, workflow Action pins | **No** (unless `skills/` also edited) | **No** until runtime deps change       | Automated PR is eligible; merge after green CI; **no** changeset                                                                                   |
| **B — Published npm runtime** | `packages/mdcp-*/` runtime deps or shipped sources                                                        | **No** directly                       | **Yes** on next Release                | Automated PR is allowed; merge needs a **human** plus a **patch** changeset; ship via the normal Release job                                       |
| **C — Skill install surface** | `skills/` and skill-carrier version sync into `metadata.version`                                          | **Yes** on next `npx skills add`      | GitHub Release notes for carriers only | **Never auto-merge**; human review plus a changeset targeting `@bwilliamson/skill-<id>`; prefer intentional skill releases over drive-by tip churn |

## Eligibility for future automation

This repository does **not** run an AI assistant or `workflow_run` heal job in CI ([GitHub Actions security checklist](./github-actions-security-checklist.md)). Any future Cursor Automation or bot must classify the proposed diff against these classes before opening a pull request:

- Class A only for unattended merge candidates
- Class B and Class C always stop for a human

Building that bot is a follow-up in the issue tracker, not a requirement of this shard.

## Related docs

- [Security-incident triage](./security-incident-triage.md) — prod vs dev-only, overrides, unfixed advisories
- [Versioning and releases](./versioning-and-releases.md) — changesets and Dependabot merge gates
- [Agent Skill](../features/agent-skill.md) — consumer install and vendoring
- [Cursor Cloud environment](./cursor-cloud-environment.md) — audit-before-gates gotcha
