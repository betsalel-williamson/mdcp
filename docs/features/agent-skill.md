# Agent Skill delivery

MDCP ships as a portable **Agent Skill** (`SKILL.md`) so projects inherit documentation guardrails without installing a host-specific IDE extension.

## Why a skill instead of an IDE extension

| Concern                  | Custom IDE extension                     | Agent Skill (`SKILL.md`)                                      |
| ------------------------ | ---------------------------------------- | ------------------------------------------------------------- |
| User friction            | Find and install an extension            | Zero — auto-discovered in the repo                            |
| Interoperability         | Locked to one editor host                | Cursor, Copilot, Claude Code, VS Code Agent Skills, CLI hosts |
| Maintenance              | UI / API updates per host                | Markdown skill bundle                                         |
| Protocol source of truth | Risk of duplicating prompts in host code | Points at `mdcp.v*.llms.txt` + `spec/extensions/`             |

## Format and location (spike outcome)

- **Format:** `SKILL.md` per the [Agent Skills](https://agentskills.io) open standard (required filename for discovery).
- **Preferred path:** [`.agents/skills/mdcp/SKILL.md`](../../.agents/skills/mdcp/SKILL.md) — shared project location across Cursor, GitHub Copilot, and VS Code.
- **Also discovered by some hosts:** `.github/skills/mdcp/`, `.cursor/skills/mdcp/`.
- **Not renamed:** the protocol bootstrap stays versioned `mdcp.v*.llms.txt` from [`spec/llms-index/`](../../spec/llms-index/). The skill teaches agents to **use** that index; it does not replace it.

## What stays unchanged

- [`spec/llms-index/`](../../spec/llms-index/) — published agent bootstrap artifacts
- [`spec/extensions/`](../../spec/extensions/) — format packs, archetypes, default task prompts
- CLI / core packages — `compile`, `check`, `export`, `refs lookup`

## Consumer workflow

1. Copy `.agents/skills/mdcp/` into the consumer repository (or install from a skill registry).
2. Fetch or regenerate `mdcp.v*.llms.txt` in the docs root (`mdcp export --llms-index`).
3. Edit shards; run `mdcp compile` then `mdcp check`.
4. Load cached prompts from enabled extension packs when doing structured authoring tasks.

## Ecosystem publication

Treat `.agents/skills/mdcp/` as the skill bundle to submit to community indexes (for example VoltAgent `awesome-agent-skills`, SkillsMP / AgentSkill.sh, host partner skill lists). Keep packaging professional: one skill directory, clear `name` / `description` frontmatter, and links to upstream `spec/` rather than forking protocol text into the skill body.
