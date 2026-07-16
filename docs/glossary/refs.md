# refs

**Refs** (short for **references**) are the organized set of heading [slugs](./heading-slug.md) and [cross-links](./cross-link.md) MDCP derives from compiled guides so authors and CI can keep Markdown links coherent after stitch.

The problem refs solve is structural, not retrieval: shards merge, heading levels shift, and duplicate titles get disambiguated — so a hand-guessed `#anchor` or stale path can break after `compile`. MDCP keeps a [refs registry](./refs-registry.md) and validates links at `check` time so the **compiled** document still targets the right sections and files.

## Related wording

| Form               | Meaning                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| **refs** (noun)    | The reference system as a whole (slugs + links + registry)                        |
| **refs registry**  | Derived catalog (`refs.json`) of compiled heading entries                         |
| **ref** (informal) | One heading entry or one link target under that system                            |
| **generate refs**  | Rebuild the registry from compiled output (`mdcp refs gen` / compile side effect) |
| **list refs**      | Print registry headings (`mdcp refs-list`)                                        |
| **check refs**     | Confirm registry matches compiled headings (`mdcp refs check` / via `mdcp check`) |

Doc discovery uses host search (`rg`, IDE search, or a future MCP index). Cross-link correctness uses **`mdcp check`** and optionally **`mdcp refs-list`**. Refs are not a retrieval API — see [ADR 0002](../features/adr/0002-remove-refs-lookup.md).

Not the same as ordinary “search the docs.” Refs are about **correct anchors and paths after compile**.
