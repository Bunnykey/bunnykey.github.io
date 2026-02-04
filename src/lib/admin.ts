import { Post } from "@/types";

const POSTS_STORAGE_KEY = "bunnykey_blog_posts";
const AUTH_STORAGE_KEY = "bunnykey_admin_auth";
const ADMIN_PASSWORD = "bunny2024"; // Simple password for demo

export interface DraftPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  authorId: string;
  tags: string[];
  excerpt: string;
  readTime: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth functions
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Post management functions
export function getLocalPosts(): DraftPost[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(POSTS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveLocalPost(post: DraftPost): void {
  const posts = getLocalPosts();
  const existingIndex = posts.findIndex((p) => p.id === post.id);

  if (existingIndex >= 0) {
    posts[existingIndex] = { ...post, updatedAt: new Date().toISOString() };
  } else {
    posts.push({ ...post, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
}

export function deleteLocalPost(id: string): void {
  const posts = getLocalPosts().filter((p) => p.id !== id);
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
}

export function getLocalPostBySlug(slug: string): DraftPost | undefined {
  return getLocalPosts().find((p) => p.slug === slug);
}

export function getLocalPostById(id: string): DraftPost | undefined {
  return getLocalPosts().find((p) => p.id === id);
}

// Generate unique ID
export function generateId(): string {
  return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Calculate read time
export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Convert DraftPost to Post type
export function draftToPost(draft: DraftPost): Post {
  return {
    id: draft.id,
    title: draft.title,
    slug: draft.slug,
    date: draft.date,
    authorId: draft.authorId,
    tags: draft.tags,
    excerpt: draft.excerpt,
    readTime: draft.readTime,
    content: draft.content,
    published: draft.published,
    publishedAt: draft.published ? draft.date : undefined,
    lastEditedTime: draft.updatedAt,
  };
}
