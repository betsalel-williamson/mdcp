# Conformance vectors

Machine-checkable fixtures for MDCP protocol artifacts. Parent: [GitHub #49](https://github.com/betsalel-williamson/mdcp/issues/49).

## Running

```bash
pnpm test packages/mdcp-core/test/llms-index.test.ts
pnpm test packages/mdcp-core/test/llms-index-fetch.test.ts
pnpm test packages/mdcp-core/test/protocol-version.test.ts
```

## Vectors

| Vector        | Path                             | Profile                          |
| ------------- | -------------------------------- | -------------------------------- |
| llms-index-v1 | [llms-index-v1/](llms-index-v1/) | llms-index export (protocol 1.0) |

## llms-index artifacts

Canonical files: [spec/llms-index/](../llms-index/).

| File pattern                | Role                                     |
| --------------------------- | ---------------------------------------- |
| `mdcp.v{n}.llms.txt`        | Adopted stable (immutable after release) |
| `mdcp.v{n}--draft.llms.txt` | In progress until adopted                |
| `vstable`                   | Symlink → current stable                 |
| `vdev`                      | Symlink → current draft                  |

Filename equivalence (trailing `.0` omitted):

- `mdcp.v1.llms.txt`
- `mdcp.v1.0.0.0.llms.txt`

The in-file header always uses the full four-part version: `mdcp-llms-index: 1.0.0.0`.
