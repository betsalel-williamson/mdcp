# Archetypes

Starter patterns for common documentation cultures. An archetype is **not** a separate protocol version — it is an extension bundle that composes on MDCP 1.0.

| Archetype         | Path                                       | Summary                                                     |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------- |
| OSS library       | [oss-library/](./oss-library/)             | API pointer shards; implementation detail in source         |
| Product docs site | [product-docs-site/](./product-docs-site/) | Client guide + formatting extension for static-site publish |

## Local customization

Copy an archetype into your repo, then add `docs/extensions/` for org-specific rules (review gates, compliance headings, proprietary workflows). Do not patch `mdcp.v*.llms.txt` — link extension shards from your guide manifests instead.
