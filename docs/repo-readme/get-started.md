# Get started

MDCP is delivered as a zero-dependency **Agent Skill**. Once installed in your repository, it acts as a system-level prompt that teaches your AI tools how to interact with your project's documentation. Install with the [`skills` CLI](https://www.skills.sh/docs/cli) (same path as [skills.sh](https://skills.sh)).

## Quick Start

Install the core MDCP Agent Skill into your repository:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

_(This copies the `.agents/skills/mdcp/` folder into your repository. Commit it to git to ensure all team members and agents share the same instructions)._

Once installed, your agents will proactively use MDCP commands to look up context, compile documentation, and validate references before writing code.

## Complementary Skills

You can add complementary skills for specific documentation architectures:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-oss-library
npx skills add betsalel-williamson/mdcp --skill mdcp-arch-product-docs-site
npx skills add betsalel-williamson/mdcp --skill mdcp-format-marp
```
