import { z } from 'astro:content';
import { validateRoute, normalizeMetadata } from '../lib/publishing/contract.mjs';

export const cmsEntrySchema = z.object({
  sourceId: z.string(),
  section: z.enum(['flora','seeds','nursery']),
  id: z.string().optional(),
  contractVersion: z.literal(1).optional(),
  category: z.enum(['life','food','music','travel','tech','notes']).default('notes'),
  slug: z.string(),
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
  body: z.string(),
  canonicalPath: z.string(),
  tags: z.array(z.string()).optional(),
  highlight: z.boolean().optional(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().optional(),
}).passthrough().superRefine((data,ctx)=>{
  try { validateRoute(data.section,data.slug);normalizeMetadata(data.section,data); } catch(e) {ctx.addIssue({code:z.ZodIssueCode.custom,message:(e as Error).message});}
});

export type CmsEntry = z.infer<typeof cmsEntrySchema>;
