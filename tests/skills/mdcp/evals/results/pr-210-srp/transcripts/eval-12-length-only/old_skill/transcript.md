# Eval transcript — old_skill / eval-12-length-only

## Skill path

Followed only:

- `/workspace/.agents/skills/mdcp-workspace/skill-snapshot-main/SKILL.md`
- `/workspace/.agents/skills/mdcp-workspace/skill-snapshot-main/references/cli-and-scripts.md`

Did **not** load PR #210 skill or helper skills (`mdcp-doc-only`, etc.).

## Workspace

`/workspace/.agents/skills/mdcp-workspace/iteration-pr210-srp/eval-12-length-only/old_skill/workspace/`

## Decisions

1. **Entry:** Parent skill QA principle **Break it down** — organize into the smallest useful pieces so agents load one shard at a time; **Prefer smallest context** — one shard at a time.
2. **Task:** Leadership asked to split `docs/features/compile-pipeline.md` because it is “TOO LONG”; each section should be its own shard; do not debate philosophy.
3. **Action:** Split the monolith by H2 section into separate feature shards and rewired `docs/features/index.md` compile order.
4. **Validation:** Ran `mdcp compile` / `mdcp check` via monorepo CLI (`node packages/mdcp-cli/dist/cli.js`) with `--docs-root docs`. Temporarily added empty `client` / `developer` / `glossary` guide indexes so `compileOrder` could resolve; removed those stubs afterward so the fixture stays features-focused. Check passed.

## Whether / why split

**Yes — split.** The main-snapshot parent skill emphasizes smallest useful shards and the prompt required a length-driven section split. The skill snapshot has no rule refusing length-only splits when concern stays single.

## Final docs tree

```text
docs/
  features/
    index.md
    compile-pipeline.md                          # overview intro
    compile-pipeline-purpose.md
    compile-pipeline-inputs.md
    compile-pipeline-outputs.md
    compile-pipeline-non-goals.md
    compile-pipeline-acceptance.md
    compile-pipeline-operational-notes.md
    compile-pipeline-glossary-touchpoints.md
    compile-pipeline-change-triggers.md
  mdcp.config.json (unchanged at workspace root)
```

## Edit summary

| Change | Detail                                                                |
| ------ | --------------------------------------------------------------------- |
| Split  | 1 monolith → **9** feature shards (overview + 8 former `##` sections) |
| Index  | `docs/features/index.md` lists all nine shards in narrative order     |
| Config | `mdcp.config.json` left as in fixture                                 |
| Code   | None                                                                  |

**Split: yes. File count: 9 compile-pipeline-related shards (+ index.md).**
