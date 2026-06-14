# Publishing @mdcp/*

Packages: `@mdcp/core`, `@mdcp/cli`, `@mdcp/presets`

## From repo root

```bash
pnpm build && pnpm test
npx changeset          # select @mdcp/* packages (add .changeset/ config first)
npx changeset version
npx changeset publish
```

Until Changesets is configured, publish manually from each package after `pnpm build`.

## Install surfaces

| Use case | Command |
|---|---|
| Dev dependency | `npm i -D @mdcp/cli @mdcp/presets` |
| Global CLI | `npm i -g @mdcp/cli` |
| Programmatic | `import { compileGuides, stripForLlm } from '@mdcp/core'` |

Each package runs `prepublishOnly` to build (or verify) before publish.
