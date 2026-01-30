interface Env {
  NOTION_TOKEN: string;
  POSTS_DATABASE_ID: string;
  PROJECTS_DATABASE_ID: string;
  BOOKS_DATABASE_ID: string;
  ALADIN_TTB_KEY: string;
}

const NOTION_API_VERSION = "2022-06-28";
const NOTION_API_BASE = "https://api.notion.com/v1";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Helper to make Notion API requests
async function notionFetch(
  endpoint: string,
  token: string,
  options?: { method?: string; body?: object }
) {
  const method = options?.method || (options?.body ? "POST" : "GET");
  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_API_VERSION,
      "Content-Type": "application/json",
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  return response;
}

// Extract text from Notion rich text
function extractText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map((t) => t.plain_text || "").join("");
}

// Extract URL from Notion file property
function extractFileUrl(files: any[]): string | null {
  if (!files || !Array.isArray(files) || files.length === 0) return null;
  const file = files[0];
  return file.file?.url || file.external?.url || null;
}

// Transform Notion post to API response
function transformPost(page: any) {
  const props = page.properties;
  return {
    id: page.id,
    title: extractText(props.Title?.title),
    slug: extractText(props.Slug?.rich_text),
    excerpt: extractText(props.Excerpt?.rich_text),
    tags: props.Tags?.multi_select?.map((t: any) => t.name) || [],
    published: props.Published?.checkbox || false,
    publishedAt: props.PublishedAt?.date?.start || page.created_time,
    thumbnail: extractFileUrl(props.Thumbnail?.files),
    lastEditedTime: page.last_edited_time,
  };
}

// Transform Notion project to API response
function transformProject(page: any) {
  const props = page.properties;
  return {
    id: page.id,
    title: extractText(props.Title?.title),
    year: extractText(props.Year?.rich_text) || new Date().getFullYear().toString(),
    category: props.Category?.select?.name || "Web App",
    status: props.Status?.select?.name || "Active",
    description: extractText(props.Description?.rich_text),
    longDescription: extractText(props.LongDescription?.rich_text),
    tech: props.Tech?.multi_select?.map((t: any) => t.name) || [],
    features: extractText(props.Features?.rich_text),
    image: props.Image?.url || null,
    demoLink: props.DemoLink?.url || null,
    sourceLink: props.SourceLink?.url || null,
    docsLink: props.DocsLink?.url || null,
    lastEditedTime: page.last_edited_time,
  };
}

// Fetch all posts from Notion
async function getPosts(env: Env) {
  const response = await notionFetch(
    `/databases/${env.POSTS_DATABASE_ID}/query`,
    env.NOTION_TOKEN,
    {
      body: { sorts: [{ property: "PublishedAt", direction: "descending" }] },
    }
  );

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.map(transformPost);
}

// Fetch single post by slug
async function getPostBySlug(slug: string, env: Env) {
  const response = await notionFetch(
    `/databases/${env.POSTS_DATABASE_ID}/query`,
    env.NOTION_TOKEN,
    {
      body: {
        filter: {
          property: "Slug",
          rich_text: { equals: slug },
        },
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status}`);
  }

  const data = await response.json();
  if (data.results.length === 0) return null;
  return transformPost(data.results[0]);
}

// Fetch all projects from Notion
async function getProjects(env: Env) {
  const response = await notionFetch(
    `/databases/${env.PROJECTS_DATABASE_ID}/query`,
    env.NOTION_TOKEN,
    {
      body: { sorts: [{ property: "Title", direction: "ascending" }] },
    }
  );

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.map(transformProject);
}

// Fetch single project by ID
async function getProjectById(id: string, env: Env) {
  try {
    const response = await notionFetch(`/pages/${id}`, env.NOTION_TOKEN);
    if (!response.ok) return null;
    const page = await response.json();
    return transformProject(page);
  } catch {
    return null;
  }
}

// Search books via Aladin API
async function searchAladinBooks(query: string, env: Env) {
  const aladinUrl = new URL("http://www.aladin.co.kr/ttb/api/ItemSearch.aspx");
  aladinUrl.searchParams.set("TTBKey", env.ALADIN_TTB_KEY);
  aladinUrl.searchParams.set("Query", query);
  aladinUrl.searchParams.set("QueryType", "Keyword");
  aladinUrl.searchParams.set("MaxResults", "20");
  aladinUrl.searchParams.set("SearchTarget", "Book");
  aladinUrl.searchParams.set("Output", "JS");
  aladinUrl.searchParams.set("Version", "20131101");

  const response = await fetch(aladinUrl.toString());
  const data: any = await response.json();

  return (
    data.item?.map((item: any) => ({
      isbn: item.isbn13 || item.isbn,
      title: item.title,
      author: item.author,
      publisher: item.publisher,
      pubDate: item.pubDate,
      // Convert thumbnail (coversum) to large image (cover500)
      cover: item.cover?.replace("/coversum/", "/cover500/"),
      description: item.description,
      link: item.link,
      priceStandard: item.priceStandard,
    })) || []
  );
}

// Save book to Notion
async function saveBookToNotion(book: any, env: Env) {
  const properties: any = {
    Title: { title: [{ text: { content: book.title || "" } }] },
    Author: { rich_text: [{ text: { content: book.author || "" } }] },
    ISBN: { rich_text: [{ text: { content: book.isbn || "" } }] },
    Publisher: { rich_text: [{ text: { content: book.publisher || "" } }] },
    Description: {
      rich_text: [
        { text: { content: (book.description || "").slice(0, 2000) } },
      ],
    },
    AladinLink: { url: book.link || null },
    Status: { select: { name: "읽고 싶음" } },
    AddedAt: { date: { start: new Date().toISOString().split("T")[0] } },
  };

  // Only add PubDate if it's a valid date
  if (book.pubDate) {
    properties.PubDate = { date: { start: book.pubDate } };
  }

  // Only add Cover if URL exists
  if (book.cover) {
    properties.Cover = {
      files: [{ type: "external", name: "cover", external: { url: book.cover } }],
    };
  }

  const response = await notionFetch("/pages", env.NOTION_TOKEN, {
    method: "POST",
    body: {
      parent: { database_id: env.BOOKS_DATABASE_ID },
      properties,
    },
  });

  return response;
}

// Main request handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // GET /posts - List all posts
      if (path === "/posts" && request.method === "GET") {
        const posts = await getPosts(env);
        return Response.json({ posts }, { headers: corsHeaders });
      }

      // GET /posts/:slug - Get single post by slug
      const postMatch = path.match(/^\/posts\/(.+)$/);
      if (postMatch && request.method === "GET") {
        const slug = postMatch[1];
        const post = await getPostBySlug(slug, env);
        if (!post) {
          return Response.json(
            { error: "Post not found" },
            { status: 404, headers: corsHeaders }
          );
        }
        return Response.json({ post }, { headers: corsHeaders });
      }

      // GET /projects - List all projects
      if (path === "/projects" && request.method === "GET") {
        const projects = await getProjects(env);
        return Response.json({ projects }, { headers: corsHeaders });
      }

      // GET /projects/:id - Get single project by ID
      const projectMatch = path.match(/^\/projects\/(.+)$/);
      if (projectMatch && request.method === "GET") {
        const id = projectMatch[1];
        const project = await getProjectById(id, env);
        if (!project) {
          return Response.json(
            { error: "Project not found" },
            { status: 404, headers: corsHeaders }
          );
        }
        return Response.json({ project }, { headers: corsHeaders });
      }

      // GET /aladin/search?q=<query> - Search books via Aladin API
      if (path === "/aladin/search" && request.method === "GET") {
        const query = url.searchParams.get("q");
        if (!query) {
          return Response.json(
            { error: "Query parameter 'q' is required" },
            { status: 400, headers: corsHeaders }
          );
        }

        const books = await searchAladinBooks(query, env);
        return Response.json({ books }, { headers: corsHeaders });
      }

      // GET /books - List saved books from Notion
      if (path === "/books" && request.method === "GET") {
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const response = await notionFetch(
          `/databases/${env.BOOKS_DATABASE_ID}/query`,
          env.NOTION_TOKEN,
          {
            body: {
              sorts: [{ property: "AddedAt", direction: "descending" }],
              page_size: Math.min(limit, 100),
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Notion API error: ${response.status}`);
        }

        const data = await response.json();
        const books = data.results.map((page: any) => {
          const props = page.properties;
          return {
            id: page.id,
            title: extractText(props.Title?.title),
            author: extractText(props.Author?.rich_text),
            isbn: extractText(props.ISBN?.rich_text),
            publisher: extractText(props.Publisher?.rich_text),
            cover: extractFileUrl(props.Cover?.files),
            status: props.Status?.select?.name || null,
            addedAt: props.AddedAt?.date?.start || page.created_time,
          };
        });

        return Response.json({ books }, { headers: corsHeaders });
      }

      // POST /books - Save book to Notion
      if (path === "/books" && request.method === "POST") {
        const book = await request.json();

        if (!book.title) {
          return Response.json(
            { error: "Book title is required" },
            { status: 400, headers: corsHeaders }
          );
        }

        const response = await saveBookToNotion(book, env);

        if (!response.ok) {
          const error = await response.text();
          return Response.json(
            { error: `Failed to save book: ${error}` },
            { status: response.status, headers: corsHeaders }
          );
        }

        return Response.json(
          { success: true, message: "Book saved to Notion!" },
          { headers: corsHeaders }
        );
      }

      // 404 for unknown routes
      return Response.json(
        { error: "Not found" },
        { status: 404, headers: corsHeaders }
      );
    } catch (error) {
      console.error("API Error:", error);
      return Response.json(
        { error: "Internal server error" },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
