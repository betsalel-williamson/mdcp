---
'@bwilliamson/skill-mdcp': patch
'@bwilliamson/skill-mdcp-getting-started': patch
'@bwilliamson/skill-mdcp-doc-only': patch
'@bwilliamson/skill-mdcp-design-architecture': patch
'@bwilliamson/skill-mdcp-feature-level': patch
'@bwilliamson/skill-mdcp-ux': patch
'@bwilliamson/skill-mdcp-arch-oss-library': patch
'@bwilliamson/skill-mdcp-arch-product-docs-site': patch
'@bwilliamson/skill-mdcp-arch-gtm': patch
---

Move skill version carriers and CHANGELOGs to packages/skill-* so npx skills add installs stay free of release metadata; publish skill notes on GitHub Releases in the same single-step main release job as npm packages.
