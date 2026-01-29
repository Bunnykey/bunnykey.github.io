interface Env {
  NOTION_TOKEN: string;
  POSTS_DATABASE_ID: string;
  PROJECTS_DATABASE_ID: string;
}

const NOTION_API_VERSION = "2022-06-28";
const NOTION_API_BASE = "https://api.notion.com/v1";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Helper to make Notion API requests
async function notionFetch(endpoint: string, token: string, body?: object) {
  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_API_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status}`);
  }

  return response.json();
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
  const data = await notionFetch(
    `/databases/${env.POSTS_DATABASE_ID}/query`,
    env.NOTION_TOKEN,
    {
      sorts: [{ property: "PublishedAt", direction: "descending" }],
    }
  );

  return data.results.map(transformPost);
}

// Fetch single post by slug
async function getPostBySlug(slug: string, env: Env) {
  const data = await notionFetch(
    `/databases/${env.POSTS_DATABASE_ID}/query`,
    env.NOTION_TOKEN,
    {
      filter: {
        property: "Slug",
        rich_text: { equals: slug },
      },
    }
  );

  if (data.results.length === 0) return null;
  return transformPost(data.results[0]);
}

// Fetch all projects from Notion
async function getProjects(env: Env) {
  const data = await notionFetch(
    `/databases/${env.PROJECTS_DATABASE_ID}/query`,
    env.NOTION_TOKEN,
    {
      sorts: [{ property: "Title", direction: "ascending" }],
    }
  );

  return data.results.map(transformProject);
}

// Fetch single project by ID
async function getProjectById(id: string, env: Env) {
  try {
    const page = await notionFetch(`/pages/${id}`, env.NOTION_TOKEN);
    return transformProject(page);
  } catch {
    return null;
  }
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
