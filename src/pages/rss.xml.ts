import rss from '@astrojs/rss';
import { SITE } from '../consts/site';
import { getAllPosts } from '../utils/posts';

export async function GET(context: { site: string }) {
  const allPosts = await getAllPosts();

  return rss({
    title: SITE.name,
    description: SITE.defaultDescription,
    site: context.site,
    items: allPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary || '',
      link: post.url,
    })),
  });
}
