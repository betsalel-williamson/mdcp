# MDCP conformance suite

Shared fixtures and expected outputs so independent implementations can claim MDCP 1.x compliance.

Tracked in GitHub issue [#49](https://github.com/betsalel-williamson/mdcp/issues/49).

## Running vectors (reference implementation)

From the repository root after `pnpm build`:

```bash
pnpm test packages/mdcp-core/test/protocol-version.test.ts
pnpm test packages/mdcp-core/test/llms-index.test.ts
```

## Vectors

| Vector        | Directory                        | Spec section                                 |
| ------------- | -------------------------------- | -------------------------------------------- |
| llms-index-v1 | [llms-index-v1/](llms-index-v1/) | llms-index export profile (protocol 1.0.0.0) |

## Filename equivalence

For protocol `1.0.0.0`, these filenames are equivalent:

- `mdcp.v1.llms.txt`
- `mdcp.v1.0.0.0.llms.txt`

The in-file header always uses the full four-part version: `mdcp-llms-index: 1.0.0.0`.
