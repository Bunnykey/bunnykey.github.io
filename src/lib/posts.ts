import { Post, Author, NotionPost, PostsData } from "@/types";
import postsJson from "@/../../data/posts.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog-api.sapphire7558.workers.dev";

// Static fallback data
const staticData = postsJson as unknown as PostsData;

// Default author for posts from Notion (since Notion doesn't track author)
const defaultAuthor: Author = {
  id: "bunnykey",
  name: "Bunnykey",
  role: "Developer",
  bio: "Building cool things on the web.",
  avatar: "/images/avatar-bunnykey.svg",
  links: {
    github: "https://github.com/bunnykey",
  },
};

// Transform Notion API response to our Post type
function transformNotionPost(notionPost: NotionPost): Post {
  return {
    id: notionPost.id,
    title: notionPost.title,
    slug: notionPost.slug,
    date: notionPost.publishedAt,
    authorId: "bunnykey",
    tags: notionPost.tags,
    excerpt: notionPost.excerpt,
    readTime: "3 min read",
    thumbnail: notionPost.thumbnail,
    published: notionPost.published,
    publishedAt: notionPost.publishedAt,
    lastEditedTime: notionPost.lastEditedTime,
  };
}

// Fetch all posts from the API
export async function getAllPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      console.error("Failed to fetch posts:", response.status);
      return [];
    }

    const data = await response.json();
    const posts: NotionPost[] = data.posts || [];

    return posts
      .filter((post) => post.published)
      .map(transformNotionPost)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Fetch a single post by slug
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  try {
    // First try to get the specific post
    const response = await fetch(`${API_URL}/posts/${slug}`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.post) {
        return transformNotionPost(data.post);
      }
    }

    // Fallback: get all posts and find by slug
    const posts = await getAllPosts();
    return posts.find((post) => post.slug === slug);
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    // Fallback to getting all posts
    const posts = await getAllPosts();
    return posts.find((post) => post.slug === slug);
  }
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export async function getRecentPosts(count: number = 3): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.slice(0, count);
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export async function searchPosts(query: string): Promise<Post[]> {
  const posts = await getAllPosts();
  const lowercaseQuery = query.toLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      (post.content && post.content.toLowerCase().includes(lowercaseQuery)) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getAuthorById(id: string): Author | undefined {
  // For now, return the default author
  if (id === "bunnykey") {
    return defaultAuthor;
  }
  return defaultAuthor;
}

export function getAllAuthors(): Author[] {
  return [defaultAuthor];
}

export async function getPostsWithAuthor(): Promise<(Post & { author: Author | undefined })[]> {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    ...post,
    author: getAuthorById(post.authorId || "bunnykey"),
  }));
}

// Synchronous versions for static generation (uses fallback data)
export function getAllPostsSync(): Post[] {
  return staticData.posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlugSync(slug: string): Post | undefined {
  return staticData.posts.find((post) => post.slug === slug);
}
