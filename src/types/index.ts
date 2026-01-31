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

// Saved book from Notion database (list view)
export interface SavedBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  cover: string | null;
  status: string | null;
  tags: string[];
  link: string | null;
  addedAt: string;
}

// Saved book with full details (detail view)
export interface SavedBookDetail extends SavedBook {
  pubDate: string | null;
  description: string | null;
  rating: number | null;
  review: string | null;
}

// Preset book tags
export const BOOK_PRESET_TAGS = [
  "소설",
  "에세이",
  "자기계발",
  "인문학",
  "과학",
  "경제/경영",
  "IT/프로그래밍",
  "시/문학",
  "역사",
  "추천",
] as const;

export type BookTag = (typeof BOOK_PRESET_TAGS)[number] | string;
