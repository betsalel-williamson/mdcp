---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
---

Update all dependencies to latest versions and fix transitive high-severity audit failures via pnpm-workspace.yaml overrides (fast-uri, js-yaml, brace-expansion, nanoid, browserslist, postcss, smol-toml, dompurify, @hono/node-server). Bump packageManager to pnpm@11.25.0 (11.13.0 was a broken release). Pin GitHub Actions SHAs to latest patch releases. Declare unfixable image-size advisories in audit.ignore.
