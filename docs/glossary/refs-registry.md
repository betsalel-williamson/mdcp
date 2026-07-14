# refs registry

Derived catalog of [heading slugs](./heading-slug.md) from compiled guide output, typically written as `refs.json` under `outputDir`. Parent concept: [refs](./refs.md).

The registry is **generated state**, not authored shards. `mdcp compile` (and `mdcp refs gen`) rebuild it; `mdcp check` / `mdcp refs check` verify it still matches the latest compile. Path rules: [Refs registry path](../features/refs-registry-path.md).
