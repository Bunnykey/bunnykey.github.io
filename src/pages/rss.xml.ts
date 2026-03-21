import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../consts/site';
import { filterPublished, sortByDateDesc } from '../consts/sections';

export async function GET(context: { site: string }) {
  const allFlora = filterPublished(await getCollection('flora'));
  const allNursery = filterPublished(await getCollection('nursery'));
  const allSeeds = filterPublished(await getCollection('seeds'));

  const allPosts = sortByDateDesc([
    ...allFlora.map(p => ({ ...p, section: 'flora' as const })),
    ...allNursery.map(p => ({ ...p, section: 'nursery' as const })),
    ...allSeeds.map(p => ({ ...p, section: 'seeds' as const })),
  ]);

  return rss({
    title: SITE.name,
    description: SITE.defaultDescription,
    site: context.site,
    items: allPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary || '',
      link: `/${post.section}/${post.slug}/`,
    })),
  });
}
