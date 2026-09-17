import { z, defineCollection } from 'astro:content';
import { normalizeMetadata } from '../lib/publishing/contract.mjs';
const validateFor = (collection: string) => (data: any, ctx: any) => {
  try { normalizeMetadata(collection,data); } catch (e) { ctx.addIssue({code:z.ZodIssueCode.custom,message:(e as Error).message}); }
};

const seriesSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'series.name must be a URL-safe slug'),
  title: z.string(),
  order: z.number().int().positive(),
}).optional();

const baseSchema = z.object({
  id: z.string().optional(),
  contractVersion: z.literal(1).optional(),
  title: z.string(),
  date: z.date(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.enum(['life', 'food', 'music', 'travel', 'tech', 'notes']).default('notes'),
  series: seriesSchema,
  draft: z.boolean().optional(),
});

export const collections = {
  flora: defineCollection({
    type: 'content',
    schema: baseSchema.extend({
      highlight: z.boolean().optional(),
      demo: z.enum(['TokenFlowDemo', 'ApiFlowDemo']).optional(),
    }).passthrough().superRefine(validateFor('flora')),
  }),
  nursery: defineCollection({
    type: 'content',
    schema: baseSchema.extend({
      stage: z.enum(['seed', 'growing', 'evergreen']).optional(),
    }).passthrough().superRefine(validateFor('nursery')),
  }),
  seeds: defineCollection({
    type: 'content',
    schema: baseSchema.extend({
      demo: z.enum(['ApiFlowDemo']).optional(),
    }).passthrough().superRefine(validateFor('seeds')),
  }),
};
