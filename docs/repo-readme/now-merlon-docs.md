# MDCP is now Merlon Docs

> **This repository is archived.** MDCP reached 1.0.0 under its new name, [Merlon Docs](https://github.com/Merlon-Docs/merlon). New work, fixes and releases happen there, and the docs site is now at <https://merlon-docs.github.io/merlon/>.

You are free to continue using MDCP: the `mdcp` skill, the `@bwilliamson/mdcp-*` packages and this repository stay available as they are. Please consider migrating to Merlon Docs, which is the 1.0.0 release of this project, with the improvements made since the last MDCP release.

To install the new skill:

```bash
npx skills add Merlon-Docs/merlon --skill merlon-docs
```

The CLI is now `merlon`, from [`@merlon-docs/merlon-docs-cli`](https://www.npmjs.com/package/@merlon-docs/merlon-docs-cli). On its first run in a repository it renames `mdcp.config.json` to `merlon.config.json` for you, so commit the new file in place of the old one.
