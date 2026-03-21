import { z, defineCollection } from 'astro:content';

const seriesSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'series.name must be a URL-safe slug'),
  title: z.string(),
  order: z.number().int().positive(),
}).optional();

const floraCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    highlight: z.boolean().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    series: seriesSchema,
    demo: z.enum(['TokenFlowDemo']).optional(),
    draft: z.boolean().optional(),
  }),
});

const nurseryCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    stage: z.enum(['seed', 'growing', 'evergreen']).optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    series: seriesSchema,
    draft: z.boolean().optional(),
  }),
});

const seedsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    series: seriesSchema, // Schema retained for extensibility, no UI support in v1
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  flora: floraCollection,
  nursery: nurseryCollection,
  seeds: seedsCollection,
};
