# heading slug

GitHub-style fragment id for a heading in **compiled** Markdown (the part after `#` in `[label](#slug)`). Parent concept: [refs](./refs.md).

MDCP computes slugs from final heading text after guides are stitched and demoted — same rules GitHub uses for README anchors (via `github-slugger`). Slugify is **language-agnostic**: it operates on Unicode heading text, not English chapter/section vocabulary. Duplicate titles in one document get `-1`, `-2` suffixes.

Authors should not invent fragments from shard-only titles, and should not author Pandoc [xref](./xref.md) markers to force ids. [Cross-links](./cross-link.md) must match the compiled slug, and `mdcp check` fails when they do not.
