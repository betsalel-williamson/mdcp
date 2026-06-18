import { z } from 'zod';

const GuideSourceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('h1Extract'),
    index: z.number().int().positive(),
    preamble: z.object({ promoteToH2: z.string().default('About this guide') }).optional(),
  }),
  z.object({
    type: z.literal('merge'),
    parts: z.array(
      z.object({
        fromH1Extract: z.number().int().positive(),
        demoteFirstH1: z.boolean().optional(),
      }),
    ),
    preamble: z.object({ promoteToH2: z.string().default('About this guide') }).optional(),
  }),
  z.object({
    type: z.literal('directory'),
    path: z.string(),
  }),
]);

const GuideSchema = z.object({
  name: z.string(),
  /** Shard directory relative to docs root (default: {docsRoot}/{name}/). */
  path: z.string().optional(),
  splitLevel: z.number().int().min(1).max(6).default(2),
  source: GuideSourceSchema.optional(),
  compile: z
    .object({
      preambleSection: z.string().default('about-this-guide.md'),
      /** Manifest file name (default index.md; use shards.md for review trees). */
      manifest: z.string().default('index.md'),
      /** When set, only links after this ## heading are used for compile order from the manifest. */
      sectionsHeading: z.string().optional(),
      /** Injected compile title as ## heading, followed by a blank line before the first section. */
      title: z.string().optional(),
      scopeRoot: z.string().optional(),
      /** Per-guide output path relative to outputDir (absolute allowed). */
      outputFile: z.string().optional(),
      /** Apply global banner to this guide's output (default: true for monolith, false when outputFile is set). */
      includeBanner: z.boolean().optional(),
      /** Named compile hooks (see compile/hooks.ts). String array replaces defaults; object opts out. */
      hooks: z.union([z.array(z.string()), z.record(z.string(), z.boolean())]).optional(),
      /** Cross-guide link rewrite options (assembly-time; not a compile hook). */
      crossGuideLinks: z
        .object({
          /** Guide names whose shards keep source `.md` paths instead of monolith `#slug` targets. */
          ignoreGuides: z.array(z.string()).optional(),
        })
        .optional(),
      hooksConfig: z
        .object({
          inlineInserts: z
            .object({
              searchRoots: z.array(z.string()).optional(),
            })
            .optional(),
        })
        .optional(),
      stripAnchors: z.boolean().default(true),
      links: z
        .object({
          markBroken: z.boolean().default(true),
        })
        .optional(),
    })
    .optional(),
});

export const MdcpConfigSchema = z.object({
  /** Four-part protocol version for conforming repositories (default 0.4.0.0). */
  protocolVersion: z.string().default('0.4.0.0'),

  /** Protocol artifact fetch — profile (valpha/vdev) and optional branch override. */
  protocol: z
    .object({
      /** `alpha` (valpha) or `dev` (vdev) under spec/llms-index/. Default applied at resolve time. */
      profile: z.enum(['alpha', 'dev']).optional(),
      /**
       * Git branch or tag when the profile symlink is not on `main` (dogfood / pre-release).
       * Omit for `main` or release tags (e.g. `v0.4.0`).
       */
      ref: z.string().optional(),
      /** GitHub owner/repo (default authoritative mdcp upstream). */
      repo: z.string().optional(),
      /** Path in upstream repo; overrides profile symlink (advanced). */
      path: z.string().optional(),
      llmsIndex: z
        .object({
          outputFile: z.string().optional(),
        })
        .optional(),
    })
    .optional(),

  source: z.string().optional(),
  /** Generated output root relative to docs root (default `_build`). */
  outputDir: z.string().default('_build'),
  /** Optional stitched monolith filename relative to outputDir. */
  outputFile: z.string().optional(),
  compileOrder: z.array(z.string()).min(1),
  banner: z.string().optional(),
  guides: z.array(GuideSchema).optional(),

  /** Opt-in backup of existing compile/export targets before overwrite. */
  backup: z
    .object({
      enabled: z.boolean().default(false),
      /** Directory relative to outputDir (default `.caches/backups`). */
      dir: z.string().default('.caches/backups'),
      /** Suffix appended to backup filename. */
      ext: z.string().default(''),
    })
    .default({
      enabled: false,
      dir: '.caches/backups',
      ext: '',
    }),

  refs: z
    .object({
      /** Registry path relative to outputDir. */
      registryFile: z.string().default('.caches/refs.json'),
      slugAlgorithm: z.enum(['github']).default('github'),
    })
    .default({
      registryFile: '.caches/refs.json',
      slugAlgorithm: 'github',
    }),

  lint: z
    .object({
      markdownlint: z
        .object({
          shardsConfig: z.string().optional(),
          compiledConfig: z.string().optional(),
          /** Shard lint paths relative to docs root (default: compileOrder guide dirs). */
          shardsGlobs: z.array(z.string()).optional(),
        })
        .optional(),
      links: z
        .object({
          enabled: z.boolean().default(true),
          severity: z.enum(['error', 'warn']).default('error'),
          target: z.string().optional(),
          config: z.string().optional(),
        })
        .optional(),
      xrefs: z.object({ enabled: z.boolean().default(true) }).optional(),
    })
    .optional(),

  vale: z
    .object({
      config: z.string().default('.vale.ini'),
      strictMinAlertLevel: z.string().default('error'),
      scanGlobs: z.array(z.string()).optional(),
    })
    .optional(),

  export: z
    .object({
      llm: z
        .object({
          stripHtmlComments: z.boolean().default(true),
          stripFrontmatter: z.boolean().default(true),
          stripBanner: z.boolean().default(true),
          skipIndexFiles: z.boolean().default(true),
          collapseBlankLines: z.boolean().default(true),
        })
        .default({
          stripHtmlComments: true,
          stripFrontmatter: true,
          stripBanner: true,
          skipIndexFiles: true,
          collapseBlankLines: true,
        }),
    })
    .optional(),

  /** Optional extension packs (prompts, archetypes) cached for agents. */
  extensions: z
    .object({
      packs: z
        .array(
          z.object({
            id: z.string(),
            enabled: z.boolean().default(true),
            /** Extension semver (defaults to newest catalog version compatible with protocol). */
            version: z.string().optional(),
            /** Source directory path (built-in ids merge defaults from spec). */
            path: z.string().optional(),
            /** Docs-root-relative cache directory. */
            cacheDir: z.string().optional(),
            /** Filenames to fetch into the cache (e.g. `*.prompt.md`). */
            files: z.array(z.string()).optional(),
            /** Override fetch source for this pack only (see spec/extensions/SECURITY.md). */
            source: z
              .object({
                repo: z.string().default('betsalel-williamson/mdcp'),
                ref: z.string().default('main'),
                baseUrl: z.string().url().optional(),
              })
              .optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

export type MdcpConfig = z.infer<typeof MdcpConfigSchema>;
export type MdcpConfigInput = z.input<typeof MdcpConfigSchema>;
export type GuideConfig = z.infer<typeof GuideSchema>;
export type GuideConfigInput = z.input<typeof GuideSchema>;
export type ExtensionSource = NonNullable<
  NonNullable<NonNullable<MdcpConfig['extensions']>['packs']>[number]['source']
>;
export type ExtensionPack = NonNullable<NonNullable<MdcpConfig['extensions']>['packs']>[number];
