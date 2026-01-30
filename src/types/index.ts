export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string | null;
  links: {
    github?: string;
    site?: string;
    twitter?: string;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  authorId?: string;
  tags: string[];
  excerpt: string;
  readTime?: string;
  content?: string;
  thumbnail?: string | null;
  published?: boolean;
  publishedAt?: string;
  lastEditedTime?: string;
}

// API response type from Notion-connected backend
export interface NotionPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  thumbnail: string | null;
  lastEditedTime: string;
}

export interface PostsData {
  authors: Author[];
  posts: Post[];
}

export interface Project {
  id: string;
  title: string;
  year: string;
  category: string;
  status: "Active" | "Complete" | "Conceptual";
  description: string;
  longDescription: string;
  tech: string[];
  features: string[];
  image: string;
  links: {
    demo?: string | null;
    source?: string | null;
    docs?: string | null;
  };
  metrics: Record<string, string>;
}

export interface ProjectsData {
  projects: Project[];
}

// API response type from Notion-connected backend for projects
export interface NotionProject {
  id: string;
  title: string;
  year: string;
  category: string;
  status: string;
  description: string;
  longDescription: string;
  tech: string[];
  features: string;
  image: string;
  demoLink: string | null;
  sourceLink: string | null;
  docsLink: string | null;
  lastEditedTime: string;
}

// Book type from Aladin API
export interface Book {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  cover: string;
  description: string;
  link: string;
  priceStandard?: number;
}

// Saved book from Notion database
export interface SavedBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  cover: string | null;
  status: string | null;
  link: string | null;
  addedAt: string;
}
