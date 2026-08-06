# ReDoS

**ReDoS** (Regular expression Denial of Service) is when a regular expression takes far too long on certain inputs — often because overlapping or unbounded quantifiers force the engine to explore many matching paths. Attackers (or accidental pathological strings) can stall a process that runs the pattern on untrusted or library-controlled text.

In this repository, CodeQL’s `js/polynomial-redos` rule flags that class of risk. Heading and Pandoc `{#…}` parsing in `mdcp-core` moved to shared linear helpers so those alerts close and the anti-pattern does not spread. A follow-up audit rewrote the polynomial-adjacent code-evidence line-range scanner, recorded keep/dismiss decisions for remaining core regexes, and left en-US chapter-cue prose lint in Vale ([#230](https://github.com/betsalel-williamson/mdcp/pull/230)). See [Safe markdown parsing](../developer/safe-markdown-parsing.md).
