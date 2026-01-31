# Reading Books Widget

A widget for searching and tracking books using the Aladin API (Korean book search) and Notion as a database.

## Prerequisites

- Node.js 18+
- Cloudflare account (free tier works)
- Notion account
- Aladin API key (for Korean book search) - Get one at [Aladin Open API](https://www.aladin.co.kr/ttb/wblog_manage.aspx)

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Next.js App    │────▶│  Cloudflare Worker   │────▶│  Notion DB  │
│  /widget/books  │     │  /aladin/* /books/*  │     │  (Storage)  │
└─────────────────┘     └──────────────────────┘     └─────────────┘
                                   │
                                   ▼
                        ┌─────────────────┐
                        │   Aladin API    │
                        │  (Book Search)  │
                        └─────────────────┘
```

## Setup Steps

### 1. Create Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it (e.g., "Books Widget")
4. Select your workspace
5. Copy the "Internal Integration Token" (starts with `secret_`)

### 2. Create Books Database in Notion

Create a new database in Notion with the following properties:

| Property    | Type   | Description                        |
|-------------|--------|------------------------------------|
| Title       | Title  | Book title (default title column)  |
| Author      | Text   | Book author(s)                     |
| ISBN        | Text   | ISBN identifier                    |
| Publisher   | Text   | Publisher name                     |
| Description | Text   | Book description/summary           |
| Cover       | URL    | Cover image URL                    |
| Status      | Select | Reading status (e.g., To Read, Reading, Completed) |
| AddedAt     | Date   | Date book was added                |
| PubDate     | Text   | Publication date                   |
| AladinLink  | URL    | Link to Aladin book page           |
| Rating      | Number | Your rating (1-5)                  |
| Review      | Text   | Your review/notes                  |

After creating the database:
1. Click "..." menu → "Connections" → Add your integration
2. Copy the database ID from the URL: `notion.so/{workspace}/{DATABASE_ID}?v=...`

### 3. Deploy Cloudflare Worker

```bash
cd workers/blog-api
npm install

# Set secrets (you'll be prompted to enter values)
wrangler secret put NOTION_TOKEN
wrangler secret put ALADIN_TTB_KEY

# Edit wrangler.toml and replace placeholder with your database ID
# BOOKS_DATABASE_ID = "your-actual-database-id"

# Deploy
npm run deploy
```

Note your worker URL after deployment (e.g., `https://blog-api.your-account.workers.dev`)

### 4. Configure Frontend

```bash
# From project root
cp .env.local.example .env.local

# Edit .env.local and set your worker URL
# NEXT_PUBLIC_API_URL=https://blog-api.your-account.workers.dev

npm install
npm run dev
```

### 5. Access Widget

Navigate to [http://localhost:3000/widget/books](http://localhost:3000/widget/books)

## Embedding in Notion

The widget is optimized for embedding in Notion:

1. Deploy your app to a public URL (e.g., Vercel)
2. In Notion, type `/embed`
3. Paste your widget URL: `https://bunnykey.github.io/widget/books`
4. Resize the embed block as needed

### Theme Support

The widget automatically detects system dark/light mode. You can also force a theme via URL parameter:

- Light mode: `https://bunnykey.github.io/widget/books?theme=light`
- Dark mode: `https://bunnykey.github.io/widget/books?theme=dark`

### Embed Features

- Compact, Notion-like styling
- Automatic dark mode detection
- No external navigation or headers
- Optimized for iframe constraints

## Local Development

For local development with the worker:

```bash
# Terminal 1: Run worker locally
cd workers/blog-api
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your actual secrets
npm run dev

# Terminal 2: Run Next.js
# Set NEXT_PUBLIC_API_URL=http://localhost:8787 in .env.local
npm run dev
```

## File Structure

```
blog-notion/
├── src/
│   ├── app/widget/books/          # Widget page
│   ├── components/books/          # BookSearchWidget, BookCard, BookGrid
│   ├── lib/books.ts               # API client functions
│   └── types/books.ts             # TypeScript types
├── workers/blog-api/
│   ├── src/index.ts               # Worker with /aladin/* and /books/* routes
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml              # Worker configuration
│   └── .dev.vars.example          # Local secrets template
├── .env.local.example             # Frontend env template
└── package.json                   # Frontend dependencies
```

## API Endpoints

The Cloudflare Worker exposes:

- `GET /aladin/search?query={query}` - Search books via Aladin API
- `GET /books` - List all books from Notion database
- `POST /books` - Add a book to Notion database
- `PATCH /books/{id}` - Update a book
- `DELETE /books/{id}` - Remove a book

## Troubleshooting

### CORS Errors
The worker includes CORS headers for common origins. If you're using a different domain, update the CORS configuration in `workers/blog-api/src/index.ts`.

### Aladin API Not Working
- Verify your TTB key is valid
- Check if you've exceeded API rate limits
- Ensure the key is correctly set as a secret

### Notion Connection Issues
- Verify the integration has access to the database
- Check that the database ID is correct (no dashes vs with dashes both work)
- Ensure all required properties exist with correct types
