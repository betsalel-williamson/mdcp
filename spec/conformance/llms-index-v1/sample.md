mdcp-llms-index: 1.0.0.0

# MDCP agent index (v1)

## Adoption path

1. Copy this file into your docs root.

## Query instructions (prefer smallest context)

1. `mdcp refs lookup "<topic>" --format json`
2. Read one shard file from lookup results.
3. `mdcp export --llm --stdout` only when broader context is required.

## Glossary

Maintain `docs/glossary/` for shared terms.

## Validation

Run `mdcp check` before trusting compiled output.
