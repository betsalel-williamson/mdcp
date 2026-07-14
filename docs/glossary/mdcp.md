# MDCP

**MarkDown Context Protocol** — an [Agent Skill](./agent-skills.md) and lightweight toolchain for repository documentation context. It helps teams distill mind maps, architecture notes, specs, and product ideas into small Markdown **shards** so intent stays in the right place: reviewable in git, scalable as docs grow, and readable one shard at a time by people and coding agents.

MDCP is not a magic bullet for documentation debt. It is a helpful practice and skill that puts durable system context where it compounds over time — tracing why the software exists, how to use it, and what value it delivers — for a team of one or a full product, engineering, and marketing org.

The CLI (`compile`, `check`, [refs](./refs.md) registry maintenance, and `export --llm`) implements that shared context layer alongside the skill’s behavioral guardrails.
