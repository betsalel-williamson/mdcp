# Install the MDCP skill pack

## Parent skill

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

Zero-install: copy `.agents/skills/mdcp/` into the consumer repository.

Prefer `.agents/skills/` as the portable path. Some hosts also discover `.github/skills/` or `.claude/skills/`.

## Complementary skills

As packs migrate from `spec/extensions/`:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp-prompts-defaults
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-oss-library
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-product-docs-site
npx skills add betsalel-williamson/mdcp --skill mdcp-format-marp
```

Tracking: <https://github.com/betsalel-williamson/mdcp/issues/102>

## CLI still required for compile/check

```bash
mdcp compile --config <config> --docs-root <docs-root>
mdcp check --config <config> --docs-root <docs-root>
mdcp refs lookup "<topic>" --format json --config <config> --docs-root <docs-root>
```
