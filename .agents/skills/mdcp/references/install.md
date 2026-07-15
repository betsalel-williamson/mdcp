# Install the MDCP skill pack

## Parent skill

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

Zero-install: copy `.agents/skills/mdcp/` into the consumer repository.

Prefer `.agents/skills/` as the portable path. Some hosts also discover `.github/skills/` or `.claude/skills/`.

## Complementary skills

The `mdcp` parent skill includes the core subagents (formerly `prompts-mdcp-defaults`) built-in under `.agents/skills/mdcp/agents/`.

Install archetype skills when you want the documentation system shaped for a common publishing surface:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-oss-library
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-product-docs-site
```

## CLI still required for compile/check

```bash
mdcp compile --config <config> --docs-root <docs-root>
mdcp check --config <config> --docs-root <docs-root>
mdcp refs list --config <config> --docs-root <docs-root>
```
