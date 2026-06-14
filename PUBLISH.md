# Publishing @bwilliamson/mdcp-\*

Packages: `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-presets` (fixed versioning via Changesets)

**Full publish guide:** [docs/developer/publishing.md](docs/developer/publishing.md)

**Versioning policy:** [docs/developer/versioning-and-releases.md](docs/developer/versioning-and-releases.md)

## Quick reference

### First-time publish (one time, from your machine)

```bash
npm login
pnpm install && pnpm build
pnpm changeset publish
```

Configure Trusted Publishing on npm after packages exist. Workflow: `release.yml`, repo: `betsalel-williamson/mdcp`.

### Ongoing releases

```bash
pnpm release:tag:push    # interactive — human terminal only
```

CI publishes on `v*` tag push (OIDC, no `NPM_TOKEN`).

### Before you ship

```bash
pnpm run check
pnpm docs:compile:repo   # refresh generated package READMEs
```

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
