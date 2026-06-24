# arch-manufacturing-ops

Archetype for factory procedures, equipment manuals, and shift runbooks.

## Guide layout

```text
docs/
  glossary/          # safety terms, equipment ids, acronyms
  features/          # capabilities, lines, systems
  procedures/        # SOPs, checklists, escalation
  client/            # operator-facing (optional)
  extensions/        # site-specific rules
```

## Preset

`mdcp init --mode default --preset operations`

## Format packs

Pair with `format-function-points` for scope worksheets when estimating documentation effort.
