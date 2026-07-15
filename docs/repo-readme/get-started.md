# Get started

Install MDCP when you want a **documentation system** your agents will actually follow — sharded Markdown, compile/check in CI, and less effort keeping docs honest as ideas arrive. Use the [`skills` CLI](https://www.skills.sh/docs/cli) (same path as [skills.sh](https://skills.sh)).

## Quick Start

Install the core documentation-system Agent Skill into your repository:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

_(This copies the `.agents/skills/mdcp/` folder into your repository. Commit it to git so every teammate and agent shares the same documentation discipline)._

Once installed, agents proactively look up shard context, compile documentation, and validate references before writing code.

## Complementary Skills

Shape the documentation system for your publishing surface:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-oss-library
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-product-docs-site
```
