# Compile hooks

The fixed set of per-shard transforms, and how an adopter turns them off.

## What a hook is

A hook is a named function that receives a shard body after heading demotion and returns a replacement body. Hooks run per shard, in the order the pipeline names them, before link rewriting.

A hook operates on authored Markdown and **MUST NOT** read or write anything outside the documentation tree and the repository it cites. Hooks are not a template engine: MDCP 1.0 defines no variables, no conditionals, and no parameterized partials. That exclusion is a design constraint, argued in [Preprocessor and templating](../../design-constraints/preprocessor-templating.md).

## The built-in set

MDCP 1.0 defines three hooks. A conforming implementation **MUST** implement all three and **MUST NOT** run any other hook by default.

| Hook            | Transform                                                                             |
| --------------- | ------------------------------------------------------------------------------------- |
| `stripAnchors`  | Removes explicit anchor markers from headings                                         |
| `codeEvidence`  | Rewrites links to repository source files, appending GitHub-style `#L` line fragments |
| `inlineInserts` | Inlines shared insert shards — diagrams, tables, figures — with numbered headings     |

The default pipeline is exactly `stripAnchors`, `codeEvidence`, `inlineInserts`, in that order.

`codeEvidence` resolves a line range from the link label or the path, or a symbol from the URL fragment or the label, and rebases the target relative to the rendered output. It emits `#L` fragments regardless of locale, because the fragment form is protocol output rather than prose. The words it recognizes in a label — `line`, `lines` in en-US — come from the active locale pack.

## Selecting hooks

`compile.hooks` accepts two shapes, and they mean different things.

An **array** replaces the pipeline. The named hooks run, in the given order, and the defaults do not apply. An unknown name **MUST** be ignored rather than treated as an error, so that a configuration written for a newer implementation still compiles.

An **object** opts out of defaults. Each key maps a default hook name to a boolean; a hook whose value is `false` is removed, and the remaining defaults run in their usual order. Keys that are not default hook names have no effect.

Omitting `compile.hooks` entirely runs the default pipeline.

## Anchors run twice

`stripAnchors` appears both as a hook and as a whole-document step controlled by `compile.stripAnchors`. Removing the hook from the pipeline does **not** disable the document-level pass; setting `compile.stripAnchors` to false is what disables that. An implementation **MUST** keep the two controls independent, because a hook removed for one guide should not change how anchors are treated in the output as a whole.

## Extension boundary

An implementation **MAY** offer a registration mechanism for additional hooks, as the reference implementation does internally. A conforming implementation **MUST NOT** load hooks named by configuration from disk or from the network. Configuration selects among hooks the implementation already carries; it never supplies code. The reasoning is in [Security and portability](./08-security-and-portability.md).
