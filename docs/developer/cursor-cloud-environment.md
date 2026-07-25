## Cursor Cloud environment

How this repository behaves inside Cursor cloud agents: how to stand up a new cloud environment, and the platform limitations to plan around. For the standard local toolchain and daily commands, read [Local setup](#local-setup) — this section only adds cloud-specific setup and constraints.

Durable, machine-facing notes for future agents also live in the repository `AGENTS.md` under "Cursor Cloud specific instructions". Keep the two in sync: this guide is the human-facing explanation; `AGENTS.md` is the short agent checklist.

### Setting up a new cloud environment

A fresh cloud VM needs the same toolchain as [Local setup](#local-setup), plus a few cloud-specific steps:

1. **Startup update script.** `.cursor/environment.json` holds the `install` command that runs on every VM start: it fetches remote refs, then runs `pnpm install`. That committed file is the source of truth and overrides any dashboard-saved environment. Keep it minimal — dependency refresh only, no service startup or build steps.
2. **Vale peer binary.** Vale is a peer binary, not an npm dependency. Install version 3.15.1 to `/usr/local/bin` (it persists in the VM snapshot); the exact release command is in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml). `pnpm docs:check` needs Vale on `PATH`.
3. **Build before docs or CLI.** `dist/` is gitignored and is not produced by the update script. Run `pnpm build` after a fresh checkout before `pnpm docs:check`, `pnpm docs:compile`, or invoking the `mdcp` CLI.
4. **Sync Vale styles once.** Run `pnpm vale:sync` before the first `docs:check` on a fresh clone (network required); synced styles then persist in the snapshot.
5. **Node version.** The VM runs Node 22 (satisfies `engines >=18`); CI uses Node 24. Do not switch Node unless a version-specific issue appears.
6. **Full gate.** `pnpm check` mirrors CI (typecheck, lint, format, build, test, skill:validate, docs:check).

### Platform limitations and workarounds

These are cloud-agent constraints discovered in practice. Plan work around them rather than fighting them.

| Limitation                                                                                      | Workaround                                                                                                                                              |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The `gh` CLI is **read-only** for the agent; it cannot create or modify issues or pull requests | Use the dedicated pull-request tooling for PRs and PR comments. A human creates GitHub issues from agent-supplied text; add `Closes #N` afterward.      |
| **No GitHub MCP** is available, and we do not add one in the cloud                              | Accept it. MCP servers load at session start and `.cursor/*` (except `environment.json`) is gitignored, so an agent cannot self-enable one mid-run.     |
| A GitHub **PAT in Secrets is not wired** to `gh` or any agent tool                              | Do not rely on a PAT to unblock issue creation in the cloud; it does not help. Issue creation stays a human step.                                       |
| The agent **cannot merge PRs** or push to protected `main`                                      | A human merges. The agent may merge one working branch into another locally to unblock CI (for example, a dependency-fix branch into a feature branch). |
| CI runs `pnpm audit --audit-level=high` **before** the build and test gates                     | A new advisory on a pre-existing devDependency fails audit and masks otherwise-green gates. Pin patched versions via `pnpm-workspace.yaml` overrides.   |
| The pre-commit hook runs `pnpm audit` when dependency manifests change                          | Resolve advisories (overrides) before committing manifest changes, rather than bypassing the hook.                                                      |
| commitlint rejects non-conventional subjects, including merge commits                           | Give merge commits a conventional subject such as `chore: merge …`, not `merge: …`.                                                                     |
| `gitleaks` is not installed on the VM                                                           | The pre-commit hook prints a warning and continues; CI runs the real secret scan.                                                                       |

### Recording issues without issue-creation access

Because the agent cannot open GitHub issues, capture work items as ready-to-paste issue text (title, body with acceptance criteria, labels, and project fields per [Agent work-item tracking](#agent-work-item-tracking)) inside the pull request that delivers the work. A maintainer creates the issue and links it with `Closes #N`.
