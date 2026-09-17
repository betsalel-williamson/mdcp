---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': minor
---

Make the source-file extension list broad and configurable

The set of extensions that mark a link target or path claim as naming a source
file was a fixed regex covering about 30 mostly web-stack extensions. It is now
a default list spanning JVM, .NET, systems, scripting, template, data, schema
and infrastructure formats, and `lint.sourceExtensions` adds to it for a project
on a stack the defaults do not list. Entries are accepted with or without a
leading dot, and matching is a set lookup rather than a generated pattern, so a
configured value cannot change how matching behaves.

One knob governs link validation, the `codeEvidence` compile hook, and path
resolution in prose, which additionally always accepts `.md` and `.mdx`.

Broadening the defaults exposed a compile bug: `codeEvidence` rebased a
source-file link relative to the output file only when it also added an `#L`
line fragment, so a link to a data file stayed shard-relative and broke in
output published from another directory. It now rebases whenever the target
resolves.
