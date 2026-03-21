import { z } from 'astro:content';

export const cmsEntrySchema = z.object({
  sourceId: z.string(),
  section: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
  body: z.string(),
  canonicalPath: z.string(),
  tags: z.array(z.string()).optional(),
  highlight: z.boolean().optional(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().optional(),
});

export type CmsEntry = z.infer<typeof cmsEntrySchema>;
