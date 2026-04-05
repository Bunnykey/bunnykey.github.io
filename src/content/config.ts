import { z, defineCollection } from 'astro:content';

const seriesSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'series.name must be a URL-safe slug'),
  title: z.string(),
  order: z.number().int().positive(),
}).optional();

const baseSchema = z.object({
  title: z.string(),
  date: z.date(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  series: seriesSchema,
  draft: z.boolean().optional(),
});

export const collections = {
  flora: defineCollection({
    type: 'content',
    schema: baseSchema.extend({
      highlight: z.boolean().optional(),
      demo: z.enum(['TokenFlowDemo', 'ApiFlowDemo']).optional(),
    }),
  }),
  nursery: defineCollection({
    type: 'content',
    schema: baseSchema.extend({
      stage: z.enum(['seed', 'growing', 'evergreen']).optional(),
    }),
  }),
  seeds: defineCollection({
    type: 'content',
    schema: baseSchema.extend({
      demo: z.enum(['ApiFlowDemo']).optional(),
    }),
  }),
};
