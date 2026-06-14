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
  /** Shard directory relative to --cwd (default: outputDir/name). */
  path: z.string().optional(),
  splitLevel: z.number().int().min(1).max(6).default(2),
  source: GuideSourceSchema.optional(),
  compile: z
    .object({
      preambleSection: z.string().default('about-this-guide.md'),
      /** Manifest file name (default index.md; use shards.md for review trees). */
      manifest: z.string().default('index.md'),
      /** Injected compile title as ## heading. */
      title: z.string().optional(),
      scopeRoot: z.string().optional(),
      /** Per-guide output path relative to --cwd (excluded from monolith). */
      outputFile: z.string().optional(),
      /** Apply global banner to this guide's output (default: true for monolith, false when outputFile is set). */
      includeBanner: z.boolean().optional(),
      /** Named compile hooks (see compile/hooks.ts). */
      hooks: z.array(z.string()).optional(),
      stripAnchors: z.boolean().default(true),
    })
    .optional(),
});

export const MdcpConfigSchema = z.object({
  source: z.string().optional(),
  outputDir: z.string().default('.'),
  outputFile: z.string().default('guides.md'),
  compileOrder: z.array(z.string()).min(1),
  banner: z.string().optional(),
  guides: z.array(GuideSchema).optional(),

  refs: z
    .object({
      registryFile: z.string().default('refs.json'),
      slugAlgorithm: z.enum(['github']).default('github'),
    })
    .default({
      registryFile: 'refs.json',
      slugAlgorithm: 'github',
    }),

  lint: z
    .object({
      markdownlint: z
        .object({
          shardsConfig: z.string().optional(),
          compiledConfig: z.string().optional(),
        })
        .optional(),
      links: z
        .object({
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
});

export type MdcpConfig = z.infer<typeof MdcpConfigSchema>;
export type GuideConfig = z.infer<typeof GuideSchema>;
