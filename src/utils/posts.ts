import { getCollection } from 'astro:content';
import { SECTION_KEYS, type SectionKey, filterPublished, sortByDateDesc } from '../consts/sections';

export type PostWithSection = {
  slug: string;
  section: SectionKey;
  url: string;
  data: { title: string; date: Date; summary?: string; tags?: string[]; draft?: boolean };
};

export async function getAllPosts(): Promise<PostWithSection[]> {
  const collections = await Promise.all(
    SECTION_KEYS.map(async (key) => {
      const entries = filterPublished(await getCollection(key));
      return entries.map((e) => ({
        ...e,
        section: key,
        url: `/${key}/${e.slug}/`,
      }));
    }),
  );
  return sortByDateDesc(collections.flat());
}
