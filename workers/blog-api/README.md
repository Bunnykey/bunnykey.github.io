# Blog API - Cloudflare Worker

This Cloudflare Worker serves as the API backend for the blog, fetching posts and projects from Notion.

## Setup

### 1. Install dependencies

```bash
cd workers/blog-api
npm install
```

### 2. Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "Blog API")
4. Select the workspace
5. Copy the "Internal Integration Token"

### 3. Share databases with the integration

In Notion, for both the Blog CMS and Blog Projects databases:
1. Click the "..." menu in the top right
2. Click "Connections"
3. Add your integration

### 4. Add the Notion token as a secret

```bash
wrangler secret put NOTION_TOKEN
# Paste your integration token when prompted
```

### 5. Deploy

```bash
npm run deploy
```

## API Endpoints

### Posts

- `GET /posts` - List all posts
- `GET /posts/:slug` - Get a single post by slug

### Projects

- `GET /projects` - List all projects
- `GET /projects/:id` - Get a single project by ID

## Development

```bash
npm run dev
```

This starts a local development server at http://localhost:8787.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NOTION_TOKEN` | Notion integration token (secret) |
| `POSTS_DATABASE_ID` | ID of the Blog CMS database |
| `PROJECTS_DATABASE_ID` | ID of the Blog Projects database |
